/**
 * ReservationSummary Component
 * 
 * Displays a summary of the reservation before final confirmation.
 * Features:
 * - Show all booking details
 * - Edit buttons for each section
 * - Terms & conditions checkbox
 * - Confirm booking button
 * - Clear visual hierarchy
 */

import React, { useState } from 'react';
import { TableAvailability } from '../../types/reservation';
import { formatDateForDisplay, formatTimeForDisplay } from '../../services/reservationService';

interface ReservationSummaryProps {
  // Booking details
  date: string;
  time: string;
  table: TableAvailability;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  specialRequests?: string;
  duration?: number;
  
  // Restaurant info
  restaurantName?: string;
  
  // Actions
  onEdit: (section: 'datetime' | 'table' | 'details') => void;
  onConfirm: () => void;
  
  // States
  isLoading?: boolean;
  disabled?: boolean;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  date,
  time,
  table,
  customerName,
  customerEmail,
  customerPhone,
  partySize,
  specialRequests,
  duration = 120,
  restaurantName = 'Our Restaurant',
  onEdit,
  onConfirm,
  isLoading = false,
  disabled = false,
}) => {
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Format duration for display
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return `${hours}h ${mins}m`;
  };

  // Handle confirm
  const handleConfirm = () => { onConfirm(); 
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gr-black mb-2">Review Your Reservation</h3>
        <p className="text-gray-600">Please review all details before confirming your booking</p>
      </div>

      {/* Summary Card */}
      <div className="bg-white border-2 border-gray-200 rounded-none">
        {/* Restaurant Info */}
        <div className="bg-gr-gold bg-opacity-10 border-b-2 border-gray-200 p-6">
          <h4 className="text-2xl font-bold text-gr-black mb-1">{restaurantName}</h4>
          <p className="text-gray-600">Table Reservation Confirmation</p>
        </div>

        {/* Date & Time Section */}
        <div className="border-b-2 border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-gr-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h5 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Date & Time</h5>
              </div>
              
              <p className="text-lg font-bold text-gr-black mb-1">
                {formatDateForDisplay(date)}
              </p>
              <p className="text-gray-700">
                {formatTimeForDisplay(time)} • Duration: {formatDuration(duration)}
              </p>
            </div>

            <button
              onClick={() => onEdit('datetime')}
              disabled={disabled || isLoading}
              className="text-gr-gold hover:text-gr-black font-medium text-sm uppercase tracking-wide transition-colors disabled:opacity-50"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="border-b-2 border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-gr-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h5 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Table Details</h5>
              </div>
              
              <p className="text-lg font-bold text-gr-black mb-1">
                Table {table.table_number}
              </p>
              <div className="flex items-center space-x-4 text-gray-700">
                <span>Capacity: {table.capacity} {table.capacity === 1 ? 'person' : 'people'}</span>
                {table.location && (
                  <>
                    <span>•</span>
                    <span>{table.location}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => onEdit('table')}
              disabled={disabled || isLoading}
              className="text-gr-gold hover:text-gr-black font-medium text-sm uppercase tracking-wide transition-colors disabled:opacity-50"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Guest Information Section */}
        <div className="border-b-2 border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-gr-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h5 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Guest Information</h5>
              </div>
              
              <p className="text-lg font-bold text-gr-black mb-2">{customerName}</p>
              
              <div className="space-y-1 text-gray-700">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{partySize} {partySize === 1 ? 'Guest' : 'Guests'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{customerEmail}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{customerPhone}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onEdit('details')}
              disabled={disabled || isLoading}
              className="text-gr-gold hover:text-gr-black font-medium text-sm uppercase tracking-wide transition-colors disabled:opacity-50"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Special Requests Section */}
        {specialRequests && specialRequests.trim().length > 0 && (
          <div className="border-b-2 border-gray-200 p-6">
            <div className="flex items-start space-x-2 mb-2">
              <svg className="w-5 h-5 text-gr-gold mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <div className="flex-1">
                <h5 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Special Requests</h5>
                <p className="text-gray-700">{specialRequests}</p>
              </div>
            </div>
          </div>
        )}

        {/* Important Information */}
        <div className="bg-blue-50 border-b-2 border-gray-200 p-6">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-2">Important Information:</p>
              <ul className="space-y-1 text-xs text-blue-700">
                <li>• Please arrive 10 minutes before your reservation time</li>
                <li>• Your table will be held for 15 minutes after reservation time</li>
                <li>• For changes or cancellations, please contact us at least 2 hours in advance</li>
                <li>• A confirmation will be sent to your email and phone</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="p-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={disabled || isLoading}
              className="mt-1 w-5 h-5 text-gr-gold border-2 border-gray-300 rounded-none focus:ring-gr-gold focus:ring-2 disabled:opacity-50"
            />
            <div className="flex-1 text-sm text-gray-700">
              <span>I agree to the </span>
              <button
                type="button"
                className="text-gr-gold hover:underline font-medium"
                onClick={() => {/* Open terms modal */}}
              >
                Terms & Conditions
              </button>
              <span> and </span>
              <button
                type="button"
                className="text-gr-gold hover:underline font-medium"
                onClick={() => {/* Open cancellation policy modal */}}
              >
                Cancellation Policy
              </button>
              <span>. I understand that late cancellations may incur a fee.</span>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleConfirm}
          disabled={disabled || isLoading}
          className={`
            flex-1 px-8 py-4 rounded-none font-bold uppercase tracking-wide transition-all duration-300
            ${!disabled && !isLoading
              ? 'bg-gr-gold text-white hover:bg-opacity-90 hover:shadow-lg'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirming Reservation...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Confirm Reservation
            </span>
          )}
        </button>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-none p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-green-800">
            <p className="font-medium mb-1">Secure Booking</p>
            <p className="text-xs text-green-700">
              Your reservation is secure and your payment information is protected. You will receive a confirmation email immediately after booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationSummary;
