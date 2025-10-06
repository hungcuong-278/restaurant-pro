/**
 * MyReservationsPage Component
 * 
 * Displays user's reservations with filtering and management.
 * Features:
 * - List all user reservations
 * - Filter by status (upcoming, past, cancelled)
 * - Sort by date
 * - View details
 * - Cancel reservation
 * - Responsive card layout
 * - Empty states
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchMyReservations, cancelReservation } from '../../store/slices/reservationSlice';
import { Reservation, ReservationStatus, RESERVATION_STATUS_LABELS, RESERVATION_STATUS_COLORS } from '../../types/reservation';
import { formatDateForDisplay, formatTimeForDisplay } from '../../services/reservationService';

type FilterType = 'all' | 'upcoming' | 'past' | 'cancelled';

const MyReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { reservations, isLoading, error } = useSelector(
    (state: RootState) => state.reservation
  );
  const { user, isAuthenticated } = useAuth();

  const [filter, setFilter] = useState<FilterType>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      alert('Please login to view your reservations');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user reservations
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMyReservations());
    }
  }, [user, dispatch]);

  // Filter reservations
  const getFilteredReservations = (): Reservation[] => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return reservations.filter((r) => {
          const reservationDate = new Date(`${r.reservation_date}T${r.reservation_time}`);
          return reservationDate >= now && r.status !== 'cancelled' && r.status !== 'completed';
        });
      
      case 'past':
        return reservations.filter((r) => {
          const reservationDate = new Date(`${r.reservation_date}T${r.reservation_time}`);
          return reservationDate < now || r.status === 'completed';
        });
      
      case 'cancelled':
        return reservations.filter((r) => r.status === 'cancelled');
      
      case 'all':
      default:
        return reservations;
    }
  };

  const filteredReservations = getFilteredReservations();

  // Sort by date (newest first)
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    const dateA = new Date(`${a.reservation_date}T${a.reservation_time}`);
    const dateB = new Date(`${b.reservation_date}T${b.reservation_time}`);
    return dateB.getTime() - dateA.getTime();
  });

  // Handle cancel reservation
  const handleCancel = async (reservationId: string) => {
    const reservation = reservations.find((r) => r.id === reservationId);
    if (!reservation) return;

    const reservationDate = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`);
    const now = new Date();
    const hoursUntil = (reservationDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 2) {
      if (!window.confirm('This reservation is less than 2 hours away. Cancellation may incur a fee. Continue?')) {
        return;
      }
    } else {
      if (!window.confirm('Are you sure you want to cancel this reservation?')) {
        return;
      }
    }

    setCancellingId(reservationId);
    try {
      await dispatch(cancelReservation(reservationId)).unwrap();
      alert('Reservation cancelled successfully');
    } catch (err) {
      alert('Failed to cancel reservation: ' + err);
    } finally {
      setCancellingId(null);
    }
  };

  // Get status badge color
  const getStatusBadge = (status: ReservationStatus) => {
    const color = RESERVATION_STATUS_COLORS[status];
    return (
      <span className={`inline-block px-3 py-1 rounded-none text-xs font-bold uppercase tracking-wide bg-${color}-100 text-${color}-800`}>
        {RESERVATION_STATUS_LABELS[status]}
      </span>
    );
  };

  // Check if reservation can be cancelled
  const canCancel = (reservation: Reservation): boolean => {
    return reservation.status !== 'cancelled' && reservation.status !== 'completed';
  };

  // Loading state
  if (isLoading && reservations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gr-gold border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading your reservations...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gr-black mb-2">My Reservations</h1>
          <p className="text-xl text-gray-600">View and manage your table reservations</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-none p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white border-2 border-gray-200 rounded-none mb-8">
          <div className="flex flex-wrap gap-2 p-4">
            {(['all', 'upcoming', 'past', 'cancelled'] as FilterType[]).map((filterType) => {
              const count = filterType === 'all' 
                ? reservations.length 
                : getFilteredReservations().length;
              
              return (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`
                    px-6 py-3 rounded-none font-medium uppercase tracking-wide text-sm transition-all duration-300
                    ${filter === filterType
                      ? 'bg-gr-gold text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Reservations Grid */}
        {sortedReservations.length === 0 ? (
          // Empty State
          <div className="bg-white border-2 border-gray-200 rounded-none p-12 text-center">
            <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-2xl font-bold text-gr-black mb-2">No Reservations Found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't made any reservations yet"
                : `You don't have any ${filter} reservations`
              }
            </p>
            <Link
              to="/reservations/new"
              className="inline-block bg-gr-gold text-white px-8 py-3 rounded-none font-bold uppercase tracking-wide transition-all duration-300 hover:bg-opacity-90"
            >
              Make a Reservation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedReservations.map((reservation) => {
              const reservationDate = new Date(`${reservation.reservation_date}T${reservation.reservation_time}`);
              const isPast = reservationDate < new Date();
              const isCancelling = cancellingId === reservation.id;

              return (
                <div
                  key={reservation.id}
                  className="bg-white border-2 border-gray-200 rounded-none overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Card Header */}
                  <div className={`p-4 border-b-2 border-gray-200 ${isPast ? 'bg-gray-50' : 'bg-gr-gold bg-opacity-5'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                          Reservation
                        </p>
                        <p className="text-sm font-mono text-gray-500">
                          #{reservation.id.substring(0, 8).toUpperCase()}
                        </p>
                      </div>
                      {getStatusBadge(reservation.status)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-4">
                    {/* Date & Time */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-gr-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Date & Time</p>
                      </div>
                      <p className="text-sm font-bold text-gr-black">
                        {formatDateForDisplay(reservation.reservation_date)}
                      </p>
                      <p className="text-sm text-gray-700">{formatTimeForDisplay(reservation.reservation_time)}</p>
                    </div>

                    {/* Guest Info */}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <svg className="w-4 h-4 text-gr-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Party Size</p>
                      </div>
                      <p className="text-sm text-gray-700">
                        {reservation.party_size} {reservation.party_size === 1 ? 'Guest' : 'Guests'}
                      </p>
                    </div>

                    {/* Special Requests */}
                    {reservation.special_requests && reservation.special_requests.trim().length > 0 && (
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <svg className="w-4 h-4 text-gr-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Special Requests</p>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{reservation.special_requests}</p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 border-t-2 border-gray-200 bg-gray-50 flex gap-2">
                    <Link
                      to={`/reservations/confirmation/${reservation.id}`}
                      className="flex-1 bg-white border-2 border-gray-300 text-gr-black px-4 py-2 rounded-none text-sm font-medium uppercase tracking-wide transition-all duration-300 hover:border-gr-gold text-center"
                    >
                      View Details
                    </Link>
                    
                    {canCancel(reservation) && (
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        disabled={isCancelling}
                        className="px-4 py-2 bg-white border-2 border-red-300 text-red-600 rounded-none text-sm font-medium uppercase tracking-wide transition-all duration-300 hover:bg-red-50 hover:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCancelling ? (
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Make New Reservation Button */}
        {sortedReservations.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/reservations/new"
              className="inline-flex items-center space-x-2 bg-gr-gold text-white px-8 py-4 rounded-none font-bold uppercase tracking-wide transition-all duration-300 hover:bg-opacity-90 hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Make New Reservation</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReservationsPage;





