import React from 'react';
import MainLayout from './symmetra-react/src/layouts/MainLayout';
import Card from './symmetra-react/src/components/Card';

const HomePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Cooperative Decision-Making Tool
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Users">
            <p className="text-gray-600 mb-4">
              Create and manage users in the system. Each user can participate in actions and decisions.
            </p>
            <a href="/users" className="text-blue-600 hover:text-blue-800">
              Manage Users →
            </a>
          </Card>
          
          <Card title="Elements">
            <p className="text-gray-600 mb-4">
              Create and manage knowledge elements, projects, and other items. Search and link related elements.
            </p>
            <a href="/elements" className="text-blue-600 hover:text-blue-800">
              Manage Elements →
            </a>
          </Card>
          
          <Card title="Actions">
            <p className="text-gray-600 mb-4">
              Create proposals, opinions, and other actions. Vote on actions to influence decisions.
            </p>
            <a href="/actions" className="text-blue-600 hover:text-blue-800">
              Manage Actions →
            </a>
          </Card>
          
          <Card title="Decisions">
            <p className="text-gray-600 mb-4">
              View the outcomes of votes on actions and see collective decisions.
            </p>
            <a href="/decisions" className="text-blue-600 hover:text-blue-800">
              View Decisions →
            </a>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default HomePage; 