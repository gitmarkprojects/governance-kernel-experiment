"""
A minimal prototype for a cooperative decision-making and information management tool.

Features:
- Users & user management
- Elements & element management
- Actions (proposals, votes, linking, etc.)
- Very simple, JSON-based data persistence
- Basic search (placeholder for vector-based semantic search)
- FastAPI endpoints (REST-ish)
- Terminal CLI for quick interaction

Dependencies: fastapi, uvicorn (for quick web server)
"""

"""
Command Details:
---------------
create_user <username>
    - Creates a new user with the given username
    - Example: create_user alice

list_users
    - Lists all users in the system
    - Example: list_users

create_element <title> [type]
    - Creates a new element with the given title and optional type
    - Default type is "knowledge_piece" if not specified
    - Example: create_element "Climate Change Research" project

list_elements
    - Lists all elements in the system
    - Example: list_elements

search_elements <query>
    - Searches for elements containing the query string in their title
    - Example: search_elements climate

create_action <user_id> <element_id> <action_type> <content>
    - Creates a new action associated with a user and optionally an element
    - action_type can be: opinion, proposal, vote, etc.
    - content is the text description of the action
    - Example: create_action user123 element456 proposal "We should focus on renewable energy"

list_actions
    - Lists all actions in the system
    - Example: list_actions

vote_action <action_id> <user_id> <vote_value>
    - Records a vote on an action
    - vote_value should be +1 (approve), -1 (disapprove), or 0 (neutral)
    - Example: vote_action action789 user123 1

decision_outcome <action_id>
    - Calculates and displays the outcome of votes on an action
    - Example: decision_outcome action789

exit
    - Exits the CLI mode
    - Example: exit
"""

import os
import json
import uuid
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
import uvicorn
import sys

###############################################################################
# Helper: LLM API (Placeholder)
###############################################################################
def call_llm_api(prompt: str, task: str = "classify") -> Any:
    """
    Placeholder for a large language model API call.
    You might feed in prompt + task, and get classification, rating, etc.
    Implement your own external call here.
    """
    return {
        "classification": "neutral",
        "score": 0.5,
        "explanation": "Placeholder LLM result."
    }


###############################################################################
# Data Management
###############################################################################
DATA_DIR = "data"
USERS_FILE = os.path.join(DATA_DIR, "users.json")
ELEMENTS_FILE = os.path.join(DATA_DIR, "elements.json")
ACTIONS_FILE = os.path.join(DATA_DIR, "actions.json")

def ensure_data_files_exist():
    """Create JSON data files if they don't already exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    for f in [USERS_FILE, ELEMENTS_FILE, ACTIONS_FILE]:
        if not os.path.exists(f):
            with open(f, "w", encoding="utf-8") as file:
                json.dump([], file)

def load_json(filename: str) -> list:
    """Load a list of records from JSON."""
    with open(filename, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(filename: str, data: list) -> None:
    """Save a list of records to JSON."""
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

ensure_data_files_exist()

###############################################################################
# Schemas: User, Element, Action
###############################################################################
def create_user(username: str, guiding_values: Optional[List[str]] = None) -> dict:
    """
    Create a user record with a unique ID and store in users.json.
    guiding_values is just an example of user-defined values or preferences.
    """
    users = load_json(USERS_FILE)
    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "username": username,
        "guiding_values": guiding_values or [],
        "history_of_actions": [],
        "associated_elements": []  # track which elements are important to them
    }
    users.append(user)
    save_json(USERS_FILE, users)
    return user

def get_user(user_id: str) -> dict:
    """Retrieve user record by ID."""
    users = load_json(USERS_FILE)
    for user in users:
        if user["id"] == user_id:
            return user
    raise ValueError("User not found.")

def list_users() -> List[dict]:
    """List all user records."""
    return load_json(USERS_FILE)

def record_user_action(user_id: str, action_id: str) -> None:
    """Add an action ID to user's history of actions."""
    users = load_json(USERS_FILE)
    for user in users:
        if user["id"] == user_id:
            user["history_of_actions"].append(action_id)
            break
    else:
        raise ValueError("User not found.")
    save_json(USERS_FILE, users)

def create_element(title: str, element_type: str = "knowledge_piece") -> dict:
    """
    Create an Element with a unique ID.
    Has a vector placeholder (for future real embeddings),
    relationships (list of other element IDs), and an action history.
    """
    elements = load_json(ELEMENTS_FILE)
    element_id = str(uuid.uuid4())
    # A naive random vector or placeholder for demonstration
    vector_placeholder = [0.0, 0.0, 0.0]
    element = {
        "id": element_id,
        "title": title,
        "type": element_type,  # e.g., project, goal, knowledge_piece
        "vector": vector_placeholder,
        "relationships": [],   # store related element IDs
        "history_of_actions": []
    }
    elements.append(element)
    save_json(ELEMENTS_FILE, elements)
    return element

def get_element(element_id: str) -> dict:
    elements = load_json(ELEMENTS_FILE)
    for el in elements:
        if el["id"] == element_id:
            return el
    raise ValueError("Element not found.")

def list_elements() -> List[dict]:
    return load_json(ELEMENTS_FILE)

def link_elements(element_id_1: str, element_id_2: str) -> None:
    """
    Create a mutual relationship between two elements in the graph.
    """
    elements = load_json(ELEMENTS_FILE)
    idx1, idx2 = None, None
    for i, el in enumerate(elements):
        if el["id"] == element_id_1:
            idx1 = i
        if el["id"] == element_id_2:
            idx2 = i
    if idx1 is None or idx2 is None:
        raise ValueError("At least one element not found.")
    # Add each other if not already there
    if element_id_2 not in elements[idx1]["relationships"]:
        elements[idx1]["relationships"].append(element_id_2)
    if element_id_1 not in elements[idx2]["relationships"]:
        elements[idx2]["relationships"].append(element_id_1)
    save_json(ELEMENTS_FILE, elements)

def record_element_action(element_id: str, action_id: str) -> None:
    """Add an action to an element's action history."""
    elements = load_json(ELEMENTS_FILE)
    for el in elements:
        if el["id"] == element_id:
            el["history_of_actions"].append(action_id)
            break
    else:
        raise ValueError("Element not found.")
    save_json(ELEMENTS_FILE, elements)

def semantic_search(query: str) -> List[dict]:
    """
    Placeholder for actual vector-based search.
    We'll just do a naive substring match on title as a stand-in.
    """
    elements = load_json(ELEMENTS_FILE)
    results = []
    for el in elements:
        if query.lower() in el["title"].lower():
            results.append(el)
    return results

def create_action(
    user_id: str,
    element_id: Optional[str],
    action_type: str,
    content: str,
    linked_elements: Optional[List[str]] = None
) -> dict:
    """
    An action might be:
    - create new element
    - submit info / opinion on existing element
    - suggest action to others
    - vote on proposals
    - link other elements
    """
    actions = load_json(ACTIONS_FILE)
    action_id = str(uuid.uuid4())
    action_record = {
        "id": action_id,
        "user_id": user_id,
        "element_id": element_id,
        "action_type": action_type,
        "content": content,
        "linked_elements": linked_elements or [],
        "votes": {},  # store user_id -> vote_value (e.g., +1, -1, etc.)
    }

    # LLM can classify or moderate new content
    classification_result = call_llm_api(prompt=content, task="moderation")
    action_record["llm_classification"] = classification_result

    actions.append(action_record)
    save_json(ACTIONS_FILE, actions)

    # Update references
    if user_id:
        record_user_action(user_id, action_id)
    if element_id:
        record_element_action(element_id, action_id)

    return action_record

def get_action(action_id: str) -> dict:
    actions = load_json(ACTIONS_FILE)
    for act in actions:
        if act["id"] == action_id:
            return act
    raise ValueError("Action not found.")

def vote_action(action_id: str, user_id: str, vote_value: int) -> dict:
    """
    A user votes on a given action. For MVP, just store integer votes (+1, -1, etc.).
    """
    actions = load_json(ACTIONS_FILE)
    for i, act in enumerate(actions):
        if act["id"] == action_id:
            actions[i]["votes"][user_id] = vote_value
            save_json(ACTIONS_FILE, actions)
            return actions[i]
    raise ValueError("Action not found.")

def list_actions() -> List[dict]:
    return load_json(ACTIONS_FILE)

def calculate_decision_outcome(action_id: str) -> dict:
    """
    KISS MVP aggregator. For demonstration, let's sum the votes.
    """
    action = get_action(action_id)
    votes = action["votes"]
    total = sum(votes.values()) if votes else 0
    result = {
        "action_id": action_id,
        "type": action["action_type"],
        "content": action["content"],
        "vote_sum": total,
        "decision": "approved" if total > 0 else "rejected" if total < 0 else "neutral"
    }
    return result


###############################################################################
# FastAPI App
###############################################################################
app = FastAPI()

@app.get("/")
def read_root():
    """Simple health check."""
    return {"message": "Welcome to the minimal cooperative decision-making tool."}

# --- User Endpoints ---
@app.post("/users")
def api_create_user(username: str, guiding_values: Optional[List[str]] = None):
    """Create a user."""
    return create_user(username, guiding_values)

@app.get("/users")
def api_list_users():
    return list_users()

@app.get("/users/{user_id}")
def api_get_user(user_id: str):
    try:
        return get_user(user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# --- Element Endpoints ---
@app.post("/elements")
def api_create_element(title: str, element_type: str = "knowledge_piece"):
    return create_element(title, element_type)

@app.get("/elements")
def api_list_elements():
    return list_elements()

@app.get("/elements/search")
def api_search_elements(query: str):
    return semantic_search(query)

@app.post("/elements/link")
def api_link_elements(element_id_1: str, element_id_2: str):
    try:
        link_elements(element_id_1, element_id_2)
        return {"message": f"Linked elements {element_id_1} and {element_id_2}."}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/elements/{element_id}")
def api_get_element(element_id: str):
    try:
        return get_element(element_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# --- Action Endpoints ---
@app.post("/actions")
def api_create_action(
    user_id: str,
    element_id: Optional[str] = None,
    action_type: str = "opinion",
    content: str = "",
    linked_elements: Optional[List[str]] = None
):
    return create_action(user_id, element_id, action_type, content, linked_elements)

@app.get("/actions")
def api_list_actions():
    return list_actions()

@app.get("/actions/{action_id}")
def api_get_action(action_id: str):
    try:
        return get_action(action_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.post("/actions/{action_id}/vote")
def api_vote_action(action_id: str, user_id: str, vote_value: int):
    """
    For simplicity, assume vote_value in {+1, -1, 0}.
    """
    try:
        return vote_action(action_id, user_id, vote_value)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


# --- Decision Endpoints ---
@app.get("/decisions/{action_id}")
def api_calculate_decision(action_id: str):
    try:
        return calculate_decision_outcome(action_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


###############################################################################
# CLI Interaction (Minimal)
###############################################################################
def cli_mode():
    """
    Very minimal CLI usage. This is not fancy, but demonstrates
    a terminal-based flow.
    """
    print("=== CLI Mode ===")
    print("Commands:")
    print(" 1) create_user <username>")
    print(" 2) list_users")
    print(" 3) create_element <title> [type]")
    print(" 4) list_elements")
    print(" 5) search_elements <query>")
    print(" 6) create_action <user_id> <element_id> <action_type> <content>")
    print(" 7) list_actions")
    print(" 8) vote_action <action_id> <user_id> <vote_value>")
    print(" 9) decision_outcome <action_id>")
    print(" 0) exit")

    while True:
        cmd = input("> ").strip().split()
        if not cmd:
            continue

        if cmd[0] == "0":
            print("Exiting CLI.")
            break

        try:
            if cmd[0] == "create_user":
                username = cmd[1]
                user = create_user(username)
                print("Created user:", user)

            elif cmd[0] == "list_users":
                print(list_users())

            elif cmd[0] == "create_element":
                title = cmd[1]
                etype = cmd[2] if len(cmd) > 2 else "knowledge_piece"
                el = create_element(title, etype)
                print("Created element:", el)

            elif cmd[0] == "list_elements":
                print(list_elements())

            elif cmd[0] == "search_elements":
                query = cmd[1]
                print(semantic_search(query))

            elif cmd[0] == "create_action":
                user_id = cmd[1]
                element_id = cmd[2]
                action_type = cmd[3]
                content = " ".join(cmd[4:])
                act = create_action(user_id, element_id, action_type, content)
                print("Created action:", act)

            elif cmd[0] == "list_actions":
                print(list_actions())

            elif cmd[0] == "vote_action":
                action_id = cmd[1]
                user_id = cmd[2]
                vote_value = int(cmd[3])
                act = vote_action(action_id, user_id, vote_value)
                print("Action updated:", act)

            elif cmd[0] == "decision_outcome":
                action_id = cmd[1]
                dec = calculate_decision_outcome(action_id)
                print("Decision outcome:", dec)

            else:
                print("Unknown command.")
        except Exception as e:
            print("Error:", e)


###############################################################################
# Main Entry Point
###############################################################################
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "cli":
        cli_mode()
    else:
        # Run FastAPI on default port 8000
        uvicorn.run("master:app", host="127.0.0.1", port=8000, reload=False)
