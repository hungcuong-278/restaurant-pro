import React from 'react';
import Skeleton from './Skeleton';

const TableListSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <div
          key={index}
          className="p-4 border-2 rounded-lg space-y-3"
        >
          {/* Table number */}
          <Skeleton width="60%" height={20} />
          
          {/* Capacity */}
          <Skeleton width="80%" height={16} />
          
          {/* Status badge */}
          <Skeleton variant="rectangular" width="100%" height={32} className="rounded-full" />
        </div>
      ))}
    </div>
  );
};

export default TableListSkeleton;
