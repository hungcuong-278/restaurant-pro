import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AUTH_STORAGE_KEYS } from '../../types/auth';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface Reservation {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  special_requests?: string;
  table_number?: string;
  first_name?: string;
  last_name?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-green-100  text-green-800  border-green-300',
  seated:    'bg-blue-100   text-blue-800   border-blue-300',
  completed: 'bg-gray-100   text-gray-700   border-gray-300',
  cancelled: 'bg-red-100    text-red-800    border-red-300',
  no_show:   'bg-orange-100 text-orange-800 border-orange-300',
};

const getAuthHeaders = () => {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const ReservationManagementPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Guard: only admin/staff/manager
  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!['admin', 'manager', 'staff'].includes(user?.role || '')) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;

      const res = await axios.get(`${API_URL}/reservations`, {
        headers: getAuthHeaders(),
        params
      });
      const data = res.data;
      setReservations(data.reservations || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && ['admin', 'manager', 'staff'].includes(user?.role || '')) {
      fetchReservations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, dateFilter, isAuthenticated]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await axios.put(
        `${API_URL}/reservations/${id}`,
        { status: newStatus },
        { headers: getAuthHeaders() }
      );
      setReservations(prev =>
        prev.map(r => r.id === id ? { ...r, status: newStatus as any } : r)
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update reservation');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });

  const formatTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${period}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gr-black">
              Reservation <span className="text-gr-gold">Management</span>
            </h1>
            <p className="text-gray-500 mt-1">Confirm, seat, or cancel customer reservations</p>
          </div>
          <button
            onClick={fetchReservations}
            className="flex items-center gap-2 bg-gr-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-gr-gold transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gr-gold focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="seated">Seated</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-gr-gold focus:border-transparent"
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              ✕ Clear date
            </button>
          )}
          <div className="ml-auto text-sm text-gray-500 self-end pb-2">
            {reservations.length} reservation{reservations.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gr-gold"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-gray-200">
            <p className="text-5xl mb-4">📅</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Reservations Found</h3>
            <p className="text-gray-500">Try changing your filters</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gr-black text-white">
                  <tr>
                    {['Guest', 'Date & Time', 'Party', 'Table', 'Status', 'Requests', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reservations.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      {/* Guest */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{r.customer_name}</p>
                        <p className="text-xs text-gray-500">{r.customer_email}</p>
                        {r.customer_phone && <p className="text-xs text-gray-400">{r.customer_phone}</p>}
                      </td>
                      {/* Date & Time */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium text-sm text-gray-900">{formatDate(r.reservation_date)}</p>
                        <p className="text-xs text-gray-500">{formatTime(r.reservation_time)}</p>
                      </td>
                      {/* Party */}
                      <td className="px-4 py-3 text-center font-bold text-gray-900">{r.party_size}</td>
                      {/* Table */}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {r.table_number ? `Table ${r.table_number}` : '—'}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide border ${STATUS_COLORS[r.status] || ''}`}>
                          {r.status}
                        </span>
                      </td>
                      {/* Requests */}
                      <td className="px-4 py-3 text-xs text-gray-500 max-w-xs">
                        <span className="line-clamp-2">{r.special_requests || '—'}</span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {r.status === 'pending' && (
                            <button
                              onClick={() => updateStatus(r.id, 'confirmed')}
                              disabled={updatingId === r.id}
                              className="px-3 py-1 bg-green-600 text-white text-xs font-bold uppercase hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              ✓ Confirm
                            </button>
                          )}
                          {r.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(r.id, 'seated')}
                              disabled={updatingId === r.id}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              🪑 Seat
                            </button>
                          )}
                          {r.status === 'seated' && (
                            <button
                              onClick={() => updateStatus(r.id, 'completed')}
                              disabled={updatingId === r.id}
                              className="px-3 py-1 bg-gray-600 text-white text-xs font-bold uppercase hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                              ✔ Complete
                            </button>
                          )}
                          {!['cancelled', 'completed', 'no_show'].includes(r.status) && (
                            <>
                              <button
                                onClick={() => updateStatus(r.id, 'no_show')}
                                disabled={updatingId === r.id}
                                className="px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase hover:bg-orange-600 disabled:opacity-50 transition-colors"
                              >
                                No Show
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Cancel reservation for ${r.customer_name}?`))
                                    updateStatus(r.id, 'cancelled');
                                }}
                                disabled={updatingId === r.id}
                                className="px-3 py-1 bg-red-500 text-white text-xs font-bold uppercase hover:bg-red-600 disabled:opacity-50 transition-colors"
                              >
                                ✕ Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationManagementPage;
