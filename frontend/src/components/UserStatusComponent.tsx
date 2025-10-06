import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserStatusComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        👤 Trạng Thái Người Dùng
      </h2>
      
      <div className="space-y-4">
        {/* Authentication Status */}
        <div className="flex items-center space-x-2">
          <span className="font-medium">Trạng thái đăng nhập:</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isAuthenticated 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isAuthenticated ? '✅ Đã đăng nhập' : '❌ Chưa đăng nhập'}
          </span>
        </div>

        {/* Loading Status */}
        <div className="flex items-center space-x-2">
          <span className="font-medium">Trạng thái tải:</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isLoading 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isLoading ? '🔄 Đang tải...' : '✅ Hoàn thành'}
          </span>
        </div>

        {/* Error Status */}
        {error && (
          <div className="flex items-center space-x-2">
            <span className="font-medium">Lỗi:</span>
            <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
              ❌ {error}
            </span>
          </div>
        )}

        {/* User Information */}
        {user && (
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-800 mb-2">Thông tin người dùng:</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-sm">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tên:</span>
                <span>{user.first_name} {user.last_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vai trò:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'staff' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </div>
              {user.phone && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Điện thoại:</span>
                  <span>{user.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Component Info */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-800 mb-2">📊 Thông tin Component:</h3>
          <div className="text-sm text-gray-600">
            Component này sẽ cập nhật tự động khi có người:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Đăng nhập thành công</li>
              <li>Đăng ký tài khoản mới</li>
              <li>Đăng xuất</li>
              <li>Gặp lỗi xác thực</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStatusComponent;