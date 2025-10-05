import React from 'react';
import Skeleton from './Skeleton';
import Card from './Card';

const MenuItemsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((index) => (
        <Card key={index} className="p-4">
          <div className="space-y-4">
            {/* Image placeholder */}
            <Skeleton variant="rectangular" width="100%" height={180} />
            
            {/* Title */}
            <Skeleton width="80%" height={20} />
            
            {/* Description */}
            <div className="space-y-2">
              <Skeleton width="100%" />
              <Skeleton width="90%" />
            </div>
            
            {/* Price and button */}
            <div className="flex justify-between items-center pt-2">
              <Skeleton width="30%" height={24} />
              <Skeleton variant="rectangular" width={100} height={36} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MenuItemsSkeleton;
