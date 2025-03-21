import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from './symmetra-react/src/layouts/MainLayout';
import Card from './symmetra-react/src/components/Card';
import Button from './symmetra-react/src/components/Button';
import Input from './symmetra-react/src/components/Input';
import { decisionApi } from './symmetra-react/src/services/api';

const DecisionsPage: React.FC = () => {
  const [actionId, setActionId] = useState('');
  const [decision, setDecision] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const handleGetDecision = async () => {
    if (!actionId.trim()) return;
    
    try {
      setError(null);
      const result = await decisionApi.getDecisionOutcome(actionId);
      setDecision(result);
    } catch (err) {
      setError('Failed to fetch decision outcome');
      console.error(err);
    }
  };
  
  return (
    <MainLayout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Decisions</h1>
        
        <Card title="View Decision Outcome" className="mb-6">
          <div className="flex items-end gap-4 mb-4">
            <Input
              id="actionId"
              label="Action ID"
              value={actionId}
              onChange={(e) => setActionId(e.target.value)}
              placeholder="Enter action ID"
              className="flex-grow"
            />
            <Button onClick={handleGetDecision}>Get Decision</Button>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {decision && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Decision Outcome</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Action ID</p>
                  <p className="font-medium">{decision.action_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    {decision.is_approved ? (
                      <span className="text-green-600">Approved</span>
                    ) : (
                      <span className="text-red-600">Rejected</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Votes</p>
                  <p className="font-medium">{decision.total_votes}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Score</p>
                  <p className="font-medium">{decision.score}</p>
                </div>
              </div>
              
              {decision.votes && decision.votes.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-md font-medium mb-2">Vote Breakdown</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User ID
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vote Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {decision.votes.map((vote: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {vote.user_id}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {vote.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </Card>
        
        <Card title="About Decisions">
          <div className="prose">
            <p>
              Decisions in the Cooperative Decision-Making Tool are determined by the collective votes on actions.
              Each action can receive votes from users, and the system calculates a decision outcome based on these votes.
            </p>
            <h3>How Decisions Work</h3>
            <ul>
              <li>Users can vote on actions with values of -1 (against), 0 (neutral), or 1 (for)</li>
              <li>The system calculates a score by summing all vote values</li>
              <li>An action is considered approved if the score is positive</li>
              <li>Actions with negative or zero scores are considered rejected</li>
            </ul>
            <p>
              This simple voting mechanism allows for collective decision-making while keeping the system lightweight.
              Future versions may implement more sophisticated voting and decision algorithms.
            </p>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DecisionsPage; 