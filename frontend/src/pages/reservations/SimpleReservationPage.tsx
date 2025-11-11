/**
 * SimpleReservationPage - Single Page Reservation Form
 *
 * A simplified reservation page without multi-step navigation.
 * All fields are displayed on one page for quick booking.
 */

import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../contexts/AuthContext';
import { AppDispatch } from '../../store/store';
import { createReservation } from '../../store/slices/reservationSlice';
import ReservationForm from '../../components/reservations/ReservationForm';
import { RESTAURANT_ID } from '../../config/restaurant';

const SimpleReservationPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (formData: any) => {
    try {
      const reservationData = {
        restaurant_id: RESTAURANT_ID,
        table_id: formData.selectedTable?.id,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_phone: formData.customerPhone,
        party_size: formData.partySize || 2,
        reservation_date: formData.selectedDate,
        reservation_time: formData.selectedTime,
        special_requests: formData.specialRequests || '',
      };
      
      const result = await dispatch(createReservation(reservationData)).unwrap();
      navigate(`/reservations/confirmation/${result.id}`);
    } catch (error: any) {
      console.error('Reservation failed:', error);
      alert(`Reservation failed: ${error.message || 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gr-gold mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gr-black mb-4">
            Reserve Your Table
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Book your table at Golden Fork Restaurant
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-none p-8">
          <ReservationForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default SimpleReservationPage;
