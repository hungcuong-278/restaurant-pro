/**
 * BookingConfirmationPage Component
 * 
 * Displays reservation confirmation after successful booking.
 * Features:
 * - Success message with animation
 * - Booking details summary
 * - Confirmation number
 * - Quick actions (add to calendar, print, view reservations)
 * - Contact information
 * - Return to home button
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchReservationById } from '../../store/slices/reservationSlice';
import { formatDateForDisplay, formatTimeForDisplay } from '../../services/reservationService';
import { RESERVATION_STATUS_COLORS } from '../../types/reservation';

const BookingConfirmationPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { currentReservation, isLoading, error } = useSelector(
    (state: RootState) => state.reservation
  );

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(true);

  // Fetch reservation details
  useEffect(() => {
    if (reservationId) {
      dispatch(fetchReservationById(reservationId));
    }
  }, [reservationId, dispatch]);

  // Hide success animation after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSuccessAnimation(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-redirect to home after 10 seconds
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 10000); // 10 seconds

    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  // Handle add to calendar
  const handleAddToCalendar = () => {
    if (!currentReservation) return;

    const { reservation_date, reservation_time, customer_name, party_size } = currentReservation;
    
    // Create iCal format
    const startDate = new Date(`${reservation_date}T${reservation_time}`);
    const endDate = new Date(startDate.getTime() + 120 * 60000); // 2 hours later

    const formatDateForICal = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDateForICal(startDate)}`,
      `DTEND:${formatDateForICal(endDate)}`,
      `SUMMARY:Restaurant Reservation - ${customer_name}`,
      `DESCRIPTION:Table reservation for ${party_size} people`,
      'LOCATION:Grand Restaurant',
      `UID:${currentReservation.id}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\n');

    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservation-${currentReservation.id}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gr-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading reservation details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentReservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gr-black mb-2">Reservation Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'Unable to load reservation details'}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary-outline"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const {
    id,
    reservation_date,
    reservation_time,
    customer_name,
    customer_email,
    customer_phone,
    party_size,
    special_requests,
    status,
  } = currentReservation;

  return (
    <div className="min-h-screen bg-gray-50 py-12 print:py-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Animation */}
        {showSuccessAnimation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white rounded-lg p-8 text-center animate-scale-up">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gr-black mb-2">Booking Confirmed!</h3>
              <p className="text-gray-600">Your reservation has been successfully created</p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center mb-8 print:mb-4">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4 print:hidden">
            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gr-black mb-2 print:text-3xl">Reservation Confirmed!</h1>
          <p className="text-xl text-gray-600 print:text-lg">Thank you for choosing Grand Restaurant</p>
        </div>

        {/* Confirmation Number */}
        <div className="bg-gr-gold bg-opacity-10 border-2 border-gr-gold rounded-none p-6 mb-8 print:mb-4">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Confirmation Number</p>
            <p className="text-3xl font-bold text-gr-black tracking-wider print:text-2xl">{id.substring(0, 8).toUpperCase()}</p>
            <p className="text-sm text-gray-600 mt-2">Please save this number for your records</p>
          </div>
        </div>

        {/* Reservation Details Card */}
        <div className="bg-white border-2 border-gray-200 rounded-none mb-8 print:mb-4">
          {/* Header */}
          <div className="bg-gray-50 border-b-2 border-gray-200 p-6 print:p-4">
            <h2 className="text-2xl font-bold text-gr-black print:text-xl">Reservation Details</h2>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6 print:p-4 print:space-y-4">
            {/* Date & Time */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gr-gold bg-opacity-10 rounded-full flex items-center justify-center print:w-8 print:h-8">
                <svg className="w-6 h-6 text-gr-gold print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Date & Time</p>
                <p className="text-lg font-bold text-gr-black">{formatDateForDisplay(reservation_date)}</p>
                <p className="text-gray-700">{formatTimeForDisplay(reservation_time)}</p>
              </div>
            </div>

            {/* Guest Information */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gr-gold bg-opacity-10 rounded-full flex items-center justify-center print:w-8 print:h-8">
                <svg className="w-6 h-6 text-gr-gold print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Guest Information</p>
                <p className="text-lg font-bold text-gr-black">{customer_name}</p>
                <p className="text-gray-700">{party_size} {party_size === 1 ? 'Guest' : 'Guests'}</p>
                <p className="text-gray-600 text-sm mt-2">{customer_email}</p>
                <p className="text-gray-600 text-sm">{customer_phone}</p>
              </div>
            </div>

            {/* Special Requests */}
            {special_requests && special_requests.trim().length > 0 && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gr-gold bg-opacity-10 rounded-full flex items-center justify-center print:w-8 print:h-8">
                  <svg className="w-6 h-6 text-gr-gold print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Special Requests</p>
                  <p className="text-gray-700">{special_requests}</p>
                </div>
              </div>
            )}

            {/* Status */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gr-gold bg-opacity-10 rounded-full flex items-center justify-center print:w-8 print:h-8">
                <svg className="w-6 h-6 text-gr-gold print:w-4 print:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-none text-sm font-bold uppercase tracking-wide bg-${RESERVATION_STATUS_COLORS[status]}-100 text-${RESERVATION_STATUS_COLORS[status]}-800`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 print:hidden">
          <button
            onClick={handleAddToCalendar}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 hover:border-gr-gold text-gr-black px-6 py-4 rounded-none font-medium transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Add to Calendar</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 hover:border-gr-gold text-gr-black px-6 py-4 rounded-none font-medium transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Print Receipt</span>
          </button>

          <Link
            to="/reservations/my-reservations"
            className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-300 hover:border-gr-gold text-gr-black px-6 py-4 rounded-none font-medium transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>My Reservations</span>
          </Link>
        </div>

        {/* Important Information */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-none p-6 mb-8 print:mb-4 print:p-4">
          <h3 className="text-lg font-bold text-gr-black mb-3 print:text-base">Important Information</h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>A confirmation email has been sent to <strong>{customer_email}</strong></span>
            </li>
            <li className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Please arrive <strong>10 minutes before</strong> your reservation time</span>
            </li>
            <li className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Your table will be held for <strong>15 minutes</strong> after reservation time</span>
            </li>
            <li className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>For cancellations or changes, contact us at least <strong>2 hours in advance</strong></span>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="bg-white border-2 border-gray-200 rounded-none p-6 mb-8 print:p-4">
          <h3 className="text-lg font-bold text-gr-black mb-4 print:text-base">Need Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-gr-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="font-medium">Phone</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-gr-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="font-medium">Email</p>
                <p>reservations@restaurant.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 print:hidden">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gr-gold text-white px-8 py-4 rounded-none font-bold uppercase tracking-wide transition-all duration-300 hover:bg-opacity-90 hover:shadow-lg"
          >
            Return to Home
          </button>
          <Link
            to="/reservations/new"
            className="flex-1 bg-white border-2 border-gr-gold text-gr-gold px-8 py-4 rounded-none font-bold uppercase tracking-wide transition-all duration-300 hover:bg-gr-gold hover:text-white text-center"
          >
            Make Another Reservation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
