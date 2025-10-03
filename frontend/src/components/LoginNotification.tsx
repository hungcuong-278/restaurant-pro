import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const LoginNotification: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showNotification, setShowNotification] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lastUser, setLastUser] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      const currentUserKey = `${user.email}_${user.id}`;
      
      // Nếu đây là user mới hoặc user khác
      if (lastUser !== currentUserKey) {
        setShowNotification(true);
        setIsVisible(true);
        setLastUser(currentUserKey);
        
        // Bắt đầu fade-out sau 3.5 giây
        const fadeTimer = setTimeout(() => {
          setIsVisible(false);
        }, 3500);
        
        // Hoàn toàn ẩn sau 4 giây
        const hideTimer = setTimeout(() => {
          setShowNotification(false);
        }, 4000);

        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(hideTimer);
        };
      }
    } else if (!isAuthenticated && lastUser) {
      // User đã đăng xuất
      setLastUser(null);
    }
  }, [isAuthenticated, user, lastUser]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShowNotification(false), 300);
  };

  if (!showNotification || !user) {
    return null;
  }

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
    }`}>
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg max-w-sm transform hover:scale-105 transition-transform">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold">Đăng nhập thành công! 🎉</h4>
            <p className="text-sm">
              Chào mừng <strong>{user.firstName} {user.lastName}</strong>
            </p>
            <p className="text-xs opacity-90">
              Vai trò: {user.role}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 ml-2 self-start hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginNotification;