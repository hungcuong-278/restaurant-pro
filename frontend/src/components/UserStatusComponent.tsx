import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

const UserStatusComponent: React.FC = () => {
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center space-x-2">
            <span className="font-medium">Đang xử lý:</span>
            <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
              ⏳ Đang tải...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Lỗi</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* User Information */}
        {user && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2 text-green-800">Thông tin người dùng:</h3>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> {user.id}</div>
              <div><strong>Họ tên:</strong> {user.firstName} {user.lastName}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Vai trò:</strong> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                  user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                  user.role === 'staff' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Session Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Thông tin phiên:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div><strong>Token có sẵn:</strong> {localStorage.getItem('authToken') ? 'Có' : 'Không'}</div>
            <div><strong>Thời gian hiện tại:</strong> {new Date().toLocaleString('vi-VN')}</div>
            <div><strong>localStorage User:</strong> {localStorage.getItem('user') ? 'Có dữ liệu' : 'Trống'}</div>
          </div>
        </div>

        {/* Real-time Monitoring */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2 text-blue-800">🔄 Theo dõi thời gian thực:</h3>
          <div className="text-sm text-blue-700">
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