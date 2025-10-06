import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginNotification: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lastUser, setLastUser] = useState<string | null>(null);
  const [progressWidth, setProgressWidth] = useState('100%');

  useEffect(() => {
    if (isAuthenticated && user) {
      const currentUserKey = `${user.email}_${user.id}`;
      
      // Nếu đây là user mới hoặc user khác
      if (lastUser !== currentUserKey) {
        setShowNotification(true);
        setIsVisible(true);
        setLastUser(currentUserKey);
        
        // Start progress bar at 100%
        setProgressWidth('100%');
        // Trigger animation to 0% after short delay
        setTimeout(() => {
          setProgressWidth('0%');
        }, 100);

        // Hide notification after 5 seconds
        setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => {
            setShowNotification(false);
          }, 300);
        }, 5000);
      }
    }
  }, [isAuthenticated, user, lastUser]);

  if (!showNotification || !user) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-4 text-white">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">
              🎉 Welcome back!
            </p>
            <p className="text-xs opacity-90 mt-1">
              {user.first_name} {user.last_name} đã đăng nhập thành công
            </p>
            <p className="text-xs opacity-75 mt-1">
              Role: {user.role}
            </p>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 bg-white bg-opacity-20 rounded-full h-1">
          <div
            className="bg-white h-1 rounded-full transition-all duration-5000 ease-linear"
            style={{ width: progressWidth }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoginNotification;