/**
 * ReservationPage Component
 * 
 * Main page for creating a new reservation.
 * Features:
 * - Multi-step booking flow (4 steps)
 * - Progress stepper UI
 * - State management with Redux
 * - Responsive layout
 * - Back/Next navigation
 * - Error handling
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  setCurrentStep,
  nextStep,
  previousStep,
  setSelectedDate,
  setSelectedTime,
  setSelectedTable,
  setPartySize,
  clearSelection,
  fetchAvailableTables,
  createReservation,
  clearError,
} from '../../store/slices/reservationSlice';
import { BookingStep } from '../../types/reservation';
import DateTimePicker from '../../components/reservations/DateTimePicker';
import TableSelector from '../../components/reservations/TableSelector';
import ReservationForm from '../../components/reservations/ReservationForm';
import ReservationSummary from '../../components/reservations/ReservationSummary';

// Restaurant ID (Golden Fork Restaurant)
const RESTAURANT_ID = 'a8d307c4-40c2-4e11-8468-d65710bae6f3';
const RESTAURANT_NAME = 'Golden Fork Restaurant';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequests: string;
}

const ReservationPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    currentStep,
    selectedDate,
    selectedTime,
    selectedTable,
    availableTables,
    partySize,
    isCheckingAvailability,
    isCreatingReservation,
    error,
    availabilityError,
  } = useSelector((state: RootState) => state.reservation);

  const { isAuthenticated } = useAuth();

  // Local form state
  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    specialRequests: '',
  });

  // Clear selection on mount
  useEffect(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  // Check if user is authenticated, redirect to login if not
  useEffect(() => {
    if (!isAuthenticated) {
      // Save intended destination for redirect after login
      const currentPath = '/reservations/new';
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      
      // Show friendly message
      alert('Please login or create an account to make a reservation');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch available tables when date/time/partySize changes
  useEffect(() => {
    if (selectedDate && selectedTime && partySize && currentStep === 'table') {
      dispatch(
        fetchAvailableTables({
          restaurantId: RESTAURANT_ID,
          date: selectedDate,
          time: selectedTime,
          partySize,
        })
      );
    }
  }, [selectedDate, selectedTime, partySize, currentStep, dispatch]);

  // Step definitions
  const steps: { key: BookingStep; label: string; number: number }[] = [
    { key: 'datetime', label: 'Date & Time', number: 1 },
    { key: 'table', label: 'Select Table', number: 2 },
    { key: 'details', label: 'Your Details', number: 3 },
    { key: 'review', label: 'Review', number: 4 },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  // Check if current step is complete
  const isStepComplete = (step: BookingStep): boolean => {
    switch (step) {
      case 'datetime':
        return !!(selectedDate && selectedTime);
      case 'table':
        return !!selectedTable;
      case 'details':
        return !!(
          formData.customerName &&
          formData.customerEmail &&
          formData.customerPhone
        );
      case 'review':
        return true;
      default:
        return false;
    }
  };

  // Can proceed to next step
  const canProceed = isStepComplete(currentStep);

  // Handle next step
  const handleNext = () => {
    if (!canProceed) return;

    // Special case: after selecting time, fetch tables before going to next step
    if (currentStep === 'datetime' && selectedDate && selectedTime) {
      dispatch(nextStep());
      return;
    }

    dispatch(nextStep());
  };

  // Handle previous step
  const handleBack = () => {
    dispatch(previousStep());
  };

  // Handle date change
  const handleDateChange = (date: string) => {
    dispatch(setSelectedDate(date));
  };

  // Handle time change
  const handleTimeChange = (time: string) => {
    dispatch(setSelectedTime(time));
  };

  // Handle table selection
  const handleTableSelect = (table: any) => {
    dispatch(setSelectedTable(table));
  };

  // Handle party size change
  const handlePartySizeChange = (size: number) => {
    dispatch(setPartySize(size));
    // Reset table selection when party size changes
    dispatch(setSelectedTable(null));
  };

  // Handle form submit
  const handleFormSubmit = (data: any) => {
    setFormData({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      specialRequests: data.specialRequests,
    });
    dispatch(nextStep());
  };

  // Handle edit from summary
  const handleEdit = (section: 'datetime' | 'table' | 'details') => {
    dispatch(setCurrentStep(section));
  };

  // Handle final confirmation
  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !selectedTable) return;

    const reservationData = {
      restaurant_id: RESTAURANT_ID,
      table_id: selectedTable.id,
      customer_name: formData.customerName,
      customer_email: formData.customerEmail,
      customer_phone: formData.customerPhone,
      party_size: partySize,
      reservation_date: selectedDate,
      reservation_time: selectedTime,
      special_requests: formData.specialRequests,
    };

    try {
      const result = await dispatch(createReservation(reservationData)).unwrap();
      // Navigate to confirmation page
      navigate(`/reservations/confirmation/${result.id}`);
    } catch (err) {
      console.error('Failed to create reservation:', err);
      // Error is handled by Redux state
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'datetime':
        return (
          <DateTimePicker
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateChange={handleDateChange}
            onTimeChange={handleTimeChange}
            restaurantId={RESTAURANT_ID}
            partySize={partySize}
          />
        );

      case 'table':
        return (
          <TableSelector
            availableTables={availableTables}
            selectedTable={selectedTable}
            onTableSelect={handleTableSelect}
            partySize={partySize}
            isLoading={isCheckingAvailability}
          />
        );

      case 'details':
        return (
          <ReservationForm
            initialData={{
              ...formData,
              partySize,
            }}
            onSubmit={handleFormSubmit}
            onPartySizeChange={handlePartySizeChange}
            isLoading={false}
          />
        );

      case 'review':
        if (!selectedDate || !selectedTime || !selectedTable) {
          return (
            <div className="text-center py-12">
              <p className="text-red-600 font-medium">Missing reservation details</p>
              <button
                onClick={() => dispatch(setCurrentStep('datetime'))}
                className="mt-4 text-gr-gold hover:underline"
              >
                Start over
              </button>
            </div>
          );
        }

        return (
          <ReservationSummary
            date={selectedDate}
            time={selectedTime}
            table={selectedTable}
            customerName={formData.customerName}
            customerEmail={formData.customerEmail}
            customerPhone={formData.customerPhone}
            partySize={partySize}
            specialRequests={formData.specialRequests}
            restaurantName={RESTAURANT_NAME}
            onEdit={handleEdit}
            onConfirm={handleConfirm}
            isLoading={isCreatingReservation}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gr-black mb-4">Make a Reservation</h1>
          <p className="text-xl text-gray-600">
            Book your table at {RESTAURANT_NAME} in just a few simple steps
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = currentStep === step.key;
              const isCompleted = currentStepIndex > index;
              const isLast = index === steps.length - 1;

              return (
                <React.Fragment key={step.key}>
                  {/* Step Circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300
                        ${isActive
                          ? 'bg-gr-gold text-white ring-4 ring-gold-200'
                          : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        step.number
                      )}
                    </div>
                    <p
                      className={`
                        mt-2 text-sm font-medium whitespace-nowrap
                        ${isActive ? 'text-gr-gold' : isCompleted ? 'text-green-600' : 'text-gray-500'}
                      `}
                    >
                      {step.label}
                    </p>
                  </div>

                  {/* Connector Line */}
                  {!isLast && (
                    <div
                      className={`
                        flex-1 h-1 mx-4 transition-all duration-300
                        ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-none p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{error}</p>
                <button
                  onClick={() => dispatch(clearError())}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {availabilityError && currentStep === 'table' && (
          <div className="mb-6 bg-yellow-50 border-2 border-yellow-200 rounded-none p-4">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-yellow-800 font-medium">{availabilityError}</p>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="mb-8">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        {currentStep !== 'review' && (
          <div className="flex flex-col sm:flex-row gap-4">
            {currentStepIndex > 0 && (
              <button
                onClick={handleBack}
                disabled={isCreatingReservation}
                className="px-8 py-4 border-2 border-gray-300 text-gr-black rounded-none font-semibold uppercase tracking-wide transition-all duration-300 hover:border-gr-black disabled:opacity-50"
              >
                ← Back
              </button>
            )}

            {currentStep !== 'details' && (
              <button
                onClick={handleNext}
                disabled={!canProceed || isCheckingAvailability}
                className={`
                  flex-1 px-8 py-4 rounded-none font-semibold uppercase tracking-wide transition-all duration-300
                  ${canProceed && !isCheckingAvailability
                    ? 'bg-gr-gold text-white hover:bg-opacity-90 hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isCheckingAvailability ? 'Checking availability...' : 'Continue →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationPage;

