import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Load Stripe with publishable key from environment
const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
);

interface PaymentFormProps {
  orderId: string;
  amount: number;
  customerEmail?: string;
  customerName?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({
  orderId,
  amount,
  customerEmail,
  customerName,
  onSuccess,
  onError,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  // Create payment intent on component mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/stripe/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            orderId,
            customerEmail: customerEmail || 'guest@restaurant.com',
            customerName: customerName || 'Guest Customer',
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          const errorMsg = result.error?.message || 'Failed to initialize payment';
          setMessage(errorMsg);
          onError(errorMsg);
          return;
        }

        setClientSecret(result.data.clientSecret);
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to initialize payment';
        setMessage(errorMsg);
        onError(errorMsg);
      }
    };

    createPaymentIntent();
  }, [amount, orderId, customerEmail, customerName, onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${orderId}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment successful! 🎉');
        onSuccess(paymentIntent.id);
      } else {
        setMessage('Payment is processing...');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Payment failed';
      setMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Initializing payment...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Payment Information
        </h3>

        <div className="mb-4 p-4 bg-blue-50 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Order Total:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${amount.toFixed(2)}
            </span>
          </div>
        </div>

        <PaymentElement />
      </div>

      {message && (
        <div
          className={`p-4 rounded-md ${
            message.includes('successful')
              ? 'bg-green-50 text-green-800'
              : message.includes('processing')
              ? 'bg-yellow-50 text-yellow-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          <div className="flex items-center">
            {message.includes('successful') && (
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {message}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
          ) : (
            `Pay $${amount.toFixed(2)}`
          )}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 font-medium transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center flex items-center justify-center">
        <svg
          className="h-4 w-4 mr-1 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Secure payment powered by Stripe. Your payment information is encrypted.
      </p>
    </form>
  );
};

export const StripePaymentForm: React.FC<PaymentFormProps> = (props) => {
  const options = {
    mode: 'payment' as const,
    amount: Math.round(props.amount * 100), // Convert to cents
    currency: 'usd',
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
        colorBackground: '#ffffff',
        colorText: '#1f2937',
        colorDanger: '#dc2626',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm;
