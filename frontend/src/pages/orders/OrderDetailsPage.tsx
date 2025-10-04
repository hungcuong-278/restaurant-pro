import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/common/Card';

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Order Details: {orderId}
      </h1>

      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Order details will be implemented here</p>
          <p className="text-gray-400">Task 3.4: Order Details View</p>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetailsPage;
