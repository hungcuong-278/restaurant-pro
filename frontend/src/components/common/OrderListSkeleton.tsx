import React from 'react';
import Skeleton from './Skeleton';
import Card from './Card';

const OrderListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <Card key={index} className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <Skeleton width="40%" height={24} />
              <Skeleton variant="rectangular" width={80} height={24} className="rounded-full" />
            </div>

            {/* Order info */}
            <div className="space-y-2">
              <Skeleton width="60%" />
              <Skeleton width="50%" />
              <Skeleton width="70%" />
            </div>

            {/* Divider */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <Skeleton width="30%" />
                <Skeleton width="40%" height={28} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Skeleton variant="rectangular" width="48%" height={36} />
              <Skeleton variant="rectangular" width="48%" height={36} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OrderListSkeleton;
