import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthEvent {
  id: string;
  type: 'login' | 'logout' | 'registration' | 'failed_login' | 'error';
  timestamp: Date;
  message: string;
  user?: {
    email: string;
    name: string;
    role: string;
  };
}

const AuthActivityLog: React.FC = () => {
  const { user, isAuthenticated, error } = useAuth();
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);

  // Theo dõi thay đổi authentication state
  useEffect(() => {
    const createEvent = (type: AuthEvent['type'], message: string, userData?: any): AuthEvent => ({
      id: Date.now().toString(),
      type,
      user: userData ? {
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        role: userData.role
      } : undefined,
      timestamp: new Date(),
      message
    });

    // Khi user đăng nhập thành công
    if (isAuthenticated && user) {
      const existingLoginEvent = authEvents.find(
        event => event.type === 'login' && event.user?.email === user.email
      );
      
      if (!existingLoginEvent) {
        const loginEvent = createEvent(
          'login', 
          `${user.first_name} ${user.last_name} đã đăng nhập thành công`,
          user
        );
        setAuthEvents(prev => [loginEvent, ...prev].slice(0, 10)); // Giữ 10 events gần nhất
      }
    }

    // Khi có lỗi
    if (error) {
      const errorEvent = createEvent('error', `Lỗi xác thực: ${error}`);
      setAuthEvents(prev => [errorEvent, ...prev].slice(0, 10));
    }
  }, [user, isAuthenticated, error, authEvents]);

  // Xử lý logout thủ công
  useEffect(() => {
    if (!isAuthenticated && !user && authEvents.length > 0 && authEvents[0].type !== 'logout') {
      const logoutEvent: AuthEvent = {
        id: Date.now().toString(),
        type: 'logout',
        timestamp: new Date(),
        message: 'Người dùng đã đăng xuất'
      };
      setAuthEvents(prev => [logoutEvent, ...prev].slice(0, 10));
    }
  }, [isAuthenticated, user, authEvents]);

  const getEventIcon = (type: AuthEvent['type']) => {
    switch (type) {
      case 'login':
        return '🟢';
      case 'logout':
        return '🔴';
      case 'registration':
        return '🆕';
      case 'failed_login':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  };

  const getEventColor = (type: AuthEvent['type']) => {
    switch (type) {
      case 'login':
        return 'bg-green-50 border-green-200';
      case 'logout':
        return 'bg-red-50 border-red-200';
      case 'registration':
        return 'bg-blue-50 border-blue-200';
      case 'failed_login':
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        📊 Nhật Ký Hoạt Động Authentication
      </h2>
      
      <div className="space-y-3">
        {authEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có hoạt động nào được ghi nhận</p>
            <p className="text-sm mt-2">Hãy thử đăng nhập hoặc đăng ký để xem nhật ký hoạt động</p>
          </div>
        ) : (
          authEvents.map((event) => (
            <div
              key={event.id}
              className={`border rounded-lg p-4 ${getEventColor(event.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="text-lg">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {event.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(event.timestamp)}
                    </p>
                  </div>
                  
                  {event.user && (
                    <div className="mt-2 text-xs text-gray-600">
                      <span className="font-medium">{event.user.name}</span>
                      <span className="mx-2">•</span>
                      <span>{event.user.email}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">{event.user.role}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <p className="text-xs text-gray-500">
          💡 Component này tự động ghi lại các hoạt động authentication real-time.
          Tối đa 10 events gần nhất được hiển thị.
        </p>
      </div>
    </div>
  );
};

export default AuthActivityLog;