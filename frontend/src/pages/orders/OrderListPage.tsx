import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <Button 
          variant="primary"
          onClick={() => navigate('/orders/new')}
        >
          + New Order
        </Button>
      </div>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Order list will be implemented here</p>
          <p className="text-gray-400">Task 3.2: Order List View</p>
        </div>
      </Card>
    </div>
  );
};

export default OrderListPage;
