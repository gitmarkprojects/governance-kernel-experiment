import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from './symmetra-react/src/layouts/MainLayout';
import Card from './symmetra-react/src/components/Card';
import Button from './symmetra-react/src/components/Button';
import Input from './symmetra-react/src/components/Input';
import { userApi } from './symmetra-react/src/services/api';

const UsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  
  // Fetch users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userApi.getUsers,
  });
  
  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (username: string) => userApi.createUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setUsername('');
    },
  });
  
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      createUserMutation.mutate(username);
    }
  };
  
  return (
    <MainLayout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Users</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card title="Create User">
              <form onSubmit={handleCreateUser}>
                <Input
                  id="username"
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card title="User List">
              {isLoading ? (
                <p>Loading users...</p>
              ) : error ? (
                <p className="text-red-500">Error loading users</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users?.map((user: any) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <a 
                              href={`/users/${user.id}`} 
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
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
        </div>
      </div>
    </MainLayout>
  );
};

export default UsersPage; 