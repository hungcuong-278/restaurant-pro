/**
 * ReservationForm Component
 * 
 * Customer information form for reservation.
 * Features:
 * - Auto-fill from user profile if logged in
 * - Form validation
 * - Special requests textarea
 * - Party size selector
 * - Submit and reset buttons
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { RESERVATION_CONSTRAINTS } from '../../types/reservation';

interface ReservationFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  specialRequests: string;
}

interface ReservationFormProps {
  initialData?: Partial<ReservationFormData>;
  onSubmit: (data: ReservationFormData) => void;
  onPartySizeChange?: (partySize: number) => void;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

const ReservationForm: React.FC<ReservationFormProps> = ({
  initialData,
  onSubmit,
  onPartySizeChange,
  isLoading = false,
  error = null,
  disabled = false,
}) => {
  const user = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState<ReservationFormData>({
    customerName: initialData?.customerName || '',
    customerEmail: initialData?.customerEmail || '',
    customerPhone: initialData?.customerPhone || '',
    partySize: initialData?.partySize || 2,
    specialRequests: initialData?.specialRequests || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto-fill from user profile if logged in
  useEffect(() => {
    if (user && !formData.customerName && !formData.customerEmail) {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      setFormData((prev) => ({
        ...prev,
        customerName: fullName || '',
        customerEmail: user.email || '',
      }));
    }
  }, [user, formData.customerName, formData.customerEmail]);

  // Validate field
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'customerName':
        if (!value || value.trim().length === 0) {
          return 'Name is required';
        }
        if (value.trim().length < 2) {
          return 'Name must be at least 2 characters';
        }
        return '';

      case 'customerEmail':
        if (!value || value.trim().length === 0) {
          return 'Email is required';
        }
        if (!RESERVATION_CONSTRAINTS.EMAIL_PATTERN.test(value)) {
          return 'Invalid email format';
        }
        return '';

      case 'customerPhone':
        if (!value || value.trim().length === 0) {
          return 'Phone number is required';
        }
        if (!RESERVATION_CONSTRAINTS.PHONE_PATTERN.test(value)) {
          return 'Invalid phone number format';
        }
        if (value.replace(/\D/g, '').length < 10) {
          return 'Phone number must be at least 10 digits';
        }
        return '';

      case 'partySize':
        if (!value || value < RESERVATION_CONSTRAINTS.MIN_PARTY_SIZE) {
          return `Party size must be at least ${RESERVATION_CONSTRAINTS.MIN_PARTY_SIZE}`;
        }
        if (value > RESERVATION_CONSTRAINTS.MAX_PARTY_SIZE) {
          return `Party size cannot exceed ${RESERVATION_CONSTRAINTS.MAX_PARTY_SIZE}`;
        }
        return '';

      default:
        return '';
    }
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === 'partySize' ? parseInt(value) || 1 : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Validate field
    const error = validateField(name, newValue);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    // Notify parent of party size change
    if (name === 'partySize' && onPartySizeChange) {
      onPartySizeChange(newValue as number);
    }
  };

  // Handle blur (mark field as touched)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  };

  // Validate all fields
  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach((key) => {
      if (key !== 'specialRequests') {
        const error = validateField(key, formData[key as keyof ReservationFormData]);
        if (error) {
          newErrors[key] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    // Validate
    if (validateAll()) {
      onSubmit(formData);
    }
  };

  // Handle reset
  const handleReset = () => {
    const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
    setFormData({
      customerName: fullName,
      customerEmail: user?.email || '',
      customerPhone: '',
      partySize: 2,
      specialRequests: '',
    });
    setErrors({});
    setTouched({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-gr-black mb-2">Your Information</h3>
        <p className="text-gray-600">Please provide your contact details</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-none p-4">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-none p-6 space-y-6">
        {/* Party Size */}
        <div>
          <label htmlFor="partySize" className="block text-sm font-semibold text-gr-black mb-2 uppercase tracking-wide">
            Party Size *
          </label>
          <select
            id="partySize"
            name="partySize"
            value={formData.partySize}
            onChange={handleChange}
            disabled={disabled || isLoading}
            className={`
              w-full px-4 py-3 border-2 rounded-none font-medium transition-colors
              focus:outline-none focus:border-gr-gold
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.partySize && touched.partySize ? 'border-red-500' : 'border-gray-300'}
            `}
          >
            {Array.from({ length: RESERVATION_CONSTRAINTS.MAX_PARTY_SIZE }, (_, i) => i + 1).map((size) => (
              <option key={size} value={size}>
                {size} {size === 1 ? 'Person' : 'People'}
              </option>
            ))}
          </select>
          {errors.partySize && touched.partySize && (
            <p className="mt-1 text-sm text-red-600">{errors.partySize}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="customerName" className="block text-sm font-semibold text-gr-black mb-2 uppercase tracking-wide">
            Full Name *
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled || isLoading}
            placeholder="John Doe"
            className={`
              w-full px-4 py-3 border-2 rounded-none font-medium transition-colors
              focus:outline-none focus:border-gr-gold
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.customerName && touched.customerName ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.customerName && touched.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="customerEmail" className="block text-sm font-semibold text-gr-black mb-2 uppercase tracking-wide">
            Email Address *
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled || isLoading}
            placeholder="john.doe@example.com"
            className={`
              w-full px-4 py-3 border-2 rounded-none font-medium transition-colors
              focus:outline-none focus:border-gr-gold
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.customerEmail && touched.customerEmail ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.customerEmail && touched.customerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="customerPhone" className="block text-sm font-semibold text-gr-black mb-2 uppercase tracking-wide">
            Phone Number *
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled || isLoading}
            placeholder="+1 (555) 123-4567"
            className={`
              w-full px-4 py-3 border-2 rounded-none font-medium transition-colors
              focus:outline-none focus:border-gr-gold
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errors.customerPhone && touched.customerPhone ? 'border-red-500' : 'border-gray-300'}
            `}
          />
          {errors.customerPhone && touched.customerPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.customerPhone}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            We'll send you a confirmation via SMS and email
          </p>
        </div>

        {/* Special Requests */}
        <div>
          <label htmlFor="specialRequests" className="block text-sm font-semibold text-gr-black mb-2 uppercase tracking-wide">
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            disabled={disabled || isLoading}
            rows={4}
            placeholder="Any dietary restrictions, allergies, or special occasions we should know about?"
            className={`
              w-full px-4 py-3 border-2 border-gray-300 rounded-none font-medium transition-colors
              focus:outline-none focus:border-gr-gold resize-none
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          />
          <p className="mt-1 text-xs text-gray-500">
            Maximum 500 characters
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={disabled || isLoading}
            className="flex-1 bg-gr-gold text-white px-8 py-4 rounded-none font-semibold uppercase tracking-wide transition-all duration-300 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Continue to Review'
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={disabled || isLoading}
            className="px-8 py-4 border-2 border-gray-300 text-gr-black rounded-none font-semibold uppercase tracking-wide transition-all duration-300 hover:border-gr-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-none p-4">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Privacy & Security</p>
            <p className="text-xs text-blue-700">
              Your information is secure and will only be used to manage your reservation. We'll send you a confirmation and reminder before your reservation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationForm;
