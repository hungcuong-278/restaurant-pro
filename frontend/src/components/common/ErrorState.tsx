import React from 'react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
  retrying?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  showRetry = true,
  retrying = false,
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-red-900 mb-2">{title}</h3>
      <p className="text-red-700 mb-6">{message}</p>
      
      {showRetry && onRetry && (
        <Button
          variant="danger"
          onClick={onRetry}
          disabled={retrying}
          loading={retrying}
        >
          {retrying ? 'Retrying...' : 'Try Again'}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
