import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../layouts/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { actionApi } from '../services/api';

const ActionsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState('');
  const [elementId, setElementId] = useState('');
  const [actionType, setActionType] = useState('opinion');
  const [content, setContent] = useState('');
  const [voteActionId, setVoteActionId] = useState('');
  const [voteUserId, setVoteUserId] = useState('');
  const [voteValue, setVoteValue] = useState<number>(0);
  
  // Fetch actions
  const { data: actions, isLoading, error } = useQuery({
    queryKey: ['actions'],
    queryFn: actionApi.getActions,
  });
  
  // Create action mutation
  const createActionMutation = useMutation({
    mutationFn: ({ userId, elementId, actionType, content }: { 
      userId: string; 
      elementId: string | null; 
      actionType: string; 
      content: string;
    }) => actionApi.createAction(userId, elementId, actionType, content),
    onSuccess: () => {
      queryClient.invalidateQueries(['actions']);
      setUserId('');
      setElementId('');
      setActionType('opinion');
      setContent('');
    },
  });
  
  // Vote action mutation
  const voteActionMutation = useMutation({
    mutationFn: ({ actionId, userId, voteValue }: { 
      actionId: string; 
      userId: string; 
      voteValue: number;
    }) => actionApi.voteAction(actionId, userId, voteValue),
    onSuccess: () => {
      queryClient.invalidateQueries(['actions']);
      setVoteActionId('');
      setVoteUserId('');
      setVoteValue(0);
    },
  });
  
  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId && content) {
      createActionMutation.mutate({ 
        userId, 
        elementId: elementId || null, 
        actionType, 
        content 
      });
    }
  };
  
  const handleVoteAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (voteActionId && voteUserId) {
      voteActionMutation.mutate({ 
        actionId: voteActionId, 
        userId: voteUserId, 
        voteValue 
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Actions</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card title="Create Action">
            <form onSubmit={handleCreateAction}>
              <Input
                id="userId"
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID"
                required
              />
              <Input
                id="elementId"
                label="Element ID (optional)"
                value={elementId}
                onChange={(e) => setElementId(e.target.value)}
                placeholder="Enter element ID (optional)"
              />
              <Input
                id="actionType"
                label="Action Type"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                placeholder="opinion, proposal, etc."
              />
              <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter action content"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>
              <Button 
                type="submit" 
                disabled={createActionMutation.isPending}
              >
                {createActionMutation.isPending ? 'Creating...' : 'Create Action'}
              </Button>
            </form>
          </Card>
          
          <Card title="Vote on Action">
            <form onSubmit={handleVoteAction}>
              <Input
                id="voteActionId"
                label="Action ID"
                value={voteActionId}
                onChange={(e) => setVoteActionId(e.target.value)}
                placeholder="Enter action ID"
                required
              />
              <Input
                id="voteUserId"
                label="User ID"
                value={voteUserId}
                onChange={(e) => setVoteUserId(e.target.value)}
                placeholder="Enter user ID"
                required
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vote Value
                </label>
                <div className="flex space-x-4">
                  {[-1, 0, 1].map((value) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="voteValue"
                        value={value}
                        checked={voteValue === value}
                        onChange={() => setVoteValue(value)}
                        className="mr-2"
                      />
                      <span>{value === 1 ? 'Upvote' : value === -1 ? 'Downvote' : 'Neutral'}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={voteActionMutation.isPending}
              >
                {voteActionMutation.isPending ? 'Voting...' : 'Submit Vote'}
              </Button>
            </form>
          </Card>
        </div>
        
        <Card title="Action List">
          {isLoading ? (
            <p>Loading actions...</p>
          ) : error ? (
            <p className="text-red-500">Error loading actions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Votes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {actions?.map((action: any) => (
                    <tr key={action.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {action.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {action.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {action.action_type}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {action.content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {action.votes?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a 
                          href={`/actions/${action.id}`} 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View
                        </a>
                        <a 
                          href={`/decisions/${action.id}`} 
                          className="text-green-600 hover:text-green-900"
                        >
                          Decision
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default ActionsPage;
