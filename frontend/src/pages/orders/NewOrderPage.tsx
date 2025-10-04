import React from 'react';
import Card from '../../components/common/Card';

const NewOrderPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Order</h1>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Order creation form will be implemented here</p>
          <p className="text-gray-400">Task 3.3: Order Creation Form</p>
        </div>
      </Card>
    </div>
  );
};

export default NewOrderPage;
