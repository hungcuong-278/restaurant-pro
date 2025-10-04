import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverable = false }) => {
  const hoverStyles = hoverable ? 'hover:shadow-lg hover:scale-102 cursor-pointer transition-all duration-200' : '';
  
  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 ${hoverStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
