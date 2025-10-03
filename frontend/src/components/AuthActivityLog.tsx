import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface AuthEvent {
  id: string;
  type: 'login' | 'register' | 'logout' | 'error';
  user?: {
    email: string;
    name: string;
    role: string;
  };
  timestamp: Date;
  message: string;
}

const AuthActivityLog: React.FC = () => {
  const { user, isAuthenticated, error } = useSelector((state: RootState) => state.auth);
  const [authEvents, setAuthEvents] = useState<AuthEvent[]>([]);

  // Theo dõi thay đổi authentication state
  useEffect(() => {
    const createEvent = (type: AuthEvent['type'], message: string, userData?: any): AuthEvent => ({
      id: Date.now().toString(),
      type,
      user: userData ? {
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
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
          `${user.firstName} ${user.lastName} đã đăng nhập thành công`,
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
  }, [user, isAuthenticated, error]);

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
  }, [isAuthenticated, user]);

  const getEventIcon = (type: AuthEvent['type']) => {
    switch (type) {
      case 'login':
        return '✅';
      case 'register':
        return '🆕';
      case 'logout':
        return '🚪';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  };

  const getEventColor = (type: AuthEvent['type']) => {
    switch (type) {
      case 'login':
        return 'text-green-600 bg-green-50';
      case 'register':
        return 'text-blue-600 bg-blue-50';
      case 'logout':
        return 'text-gray-600 bg-gray-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        📊 Nhật Ký Hoạt Động Xác Thực
      </h2>
      
      <div className="space-y-3">
        {authEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Chưa có hoạt động nào được ghi nhận</p>
            <p className="text-sm mt-2">Thử đăng nhập hoặc đăng ký để xem log hoạt động</p>
          </div>
        ) : (
          authEvents.map((event) => (
            <div
              key={event.id}
              className={`p-4 rounded-lg border-l-4 ${getEventColor(event.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getEventIcon(event.type)}</span>
                  <div>
                    <p className="font-medium">{event.message}</p>
                    {event.user && (
                      <div className="text-sm mt-1 space-y-1">
                        <p><strong>Email:</strong> {event.user.email}</p>
                        <p><strong>Họ tên:</strong> {event.user.name}</p>
                        <p><strong>Vai trò:</strong> 
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${
                            event.user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            event.user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                            event.user.role === 'staff' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {event.user.role}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-right">
                  <p>{event.timestamp.toLocaleDateString('vi-VN')}</p>
                  <p>{event.timestamp.toLocaleTimeString('vi-VN')}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {authEvents.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={() => setAuthEvents([])}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            🗑️ Xóa tất cả log
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthActivityLog;