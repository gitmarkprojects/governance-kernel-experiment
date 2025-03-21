import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from './symmetra-react/src/layouts/MainLayout';
import Card from './symmetra-react/src/components/Card';
import Button from './symmetra-react/src/components/Button';
import Input from './symmetra-react/src/components/Input';
import { elementApi } from './symmetra-react/src/services/api';

const ElementsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [elementType, setElementType] = useState('knowledge_piece');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [elementId1, setElementId1] = useState('');
  const [elementId2, setElementId2] = useState('');
  
  // Fetch elements
  const { data: elements, isLoading, error } = useQuery({
    queryKey: ['elements'],
    queryFn: elementApi.getElements,
  });
  
  // Create element mutation
  const createElementMutation = useMutation({
    mutationFn: ({ title, elementType }: { title: string; elementType: string }) => 
      elementApi.createElement(title, elementType),
    onSuccess: () => {
      queryClient.invalidateQueries(['elements']);
      setTitle('');
      setElementType('knowledge_piece');
    },
  });
  
  // Link elements mutation
  const linkElementsMutation = useMutation({
    mutationFn: ({ id1, id2 }: { id1: string; id2: string }) => 
      elementApi.linkElements(id1, id2),
    onSuccess: () => {
      queryClient.invalidateQueries(['elements']);
      setElementId1('');
      setElementId2('');
    },
  });
  
  const handleCreateElement = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      createElementMutation.mutate({ title, elementType });
    }
  };
  
  const handleLinkElements = (e: React.FormEvent) => {
    e.preventDefault();
    if (elementId1 && elementId2) {
      linkElementsMutation.mutate({ id1: elementId1, id2: elementId2 });
    }
  };
  
  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        const results = await elementApi.searchElements(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      }
    }
  };
  
  return (
    <MainLayout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Elements</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card title="Create Element">
            <form onSubmit={handleCreateElement}>
              <Input
                id="title"
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter element title"
                required
              />
              <Input
                id="elementType"
                label="Element Type"
                value={elementType}
                onChange={(e) => setElementType(e.target.value)}
                placeholder="knowledge_piece, project, etc."
              />
              <Button 
                type="submit" 
                disabled={createElementMutation.isPending}
              >
                {createElementMutation.isPending ? 'Creating...' : 'Create Element'}
              </Button>
            </form>
          </Card>
          
          <Card title="Link Elements">
            <form onSubmit={handleLinkElements}>
              <Input
                id="elementId1"
                label="Element ID 1"
                value={elementId1}
                onChange={(e) => setElementId1(e.target.value)}
                placeholder="Enter first element ID"
                required
              />
              <Input
                id="elementId2"
                label="Element ID 2"
                value={elementId2}
                onChange={(e) => setElementId2(e.target.value)}
                placeholder="Enter second element ID"
                required
              />
              <Button 
                type="submit" 
                disabled={linkElementsMutation.isPending}
              >
                {linkElementsMutation.isPending ? 'Linking...' : 'Link Elements'}
              </Button>
            </form>
          </Card>
        </div>
        
        <Card title="Search Elements" className="mb-6">
          <div className="flex items-end gap-4">
            <Input
              id="searchQuery"
              label="Search Query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search terms"
              className="flex-grow"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Search Results</h3>
              <ul className="divide-y divide-gray-200">
                {searchResults.map((element) => (
                  <li key={element.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{element.title}</p>
                        <p className="text-sm text-gray-500">Type: {element.type}</p>
                      </div>
                      <a 
                        href={`/elements/${element.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        View
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        
        <Card title="Element List">
          {isLoading ? (
            <p>Loading elements...</p>
          ) : error ? (
            <p className="text-red-500">Error loading elements</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {elements?.map((element: any) => (
                    <tr key={element.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {element.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {element.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {element.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a 
                          href={`/elements/${element.id}`} 
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
    </MainLayout>
  );
};

export default ElementsPage; 