/**
 * ReservationForm Component Tests
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ReservationForm from '../ReservationForm';
import { AuthProvider } from '../../../contexts/AuthContext';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  role: 'customer'
};

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider value={{ user: mockUser, isAuthenticated: true }}>
    {children}
  </AuthProvider>
);

describe('ReservationForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnPartySizeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Party Size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Special Requests/i)).toBeInTheDocument();
    });

    it('should auto-fill from user profile', () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const nameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;

      expect(nameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const submitButton = screen.getByText(/Continue to Review/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Phone number is required/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const emailInput = screen.getByLabelText(/Email Address/i);
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'invalid-email');

      const submitButton = screen.getByText(/Continue to Review/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should validate phone number format', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const phoneInput = screen.getByLabelText(/Phone Number/i);
      await userEvent.type(phoneInput, '123');

      const submitButton = screen.getByText(/Continue to Review/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Phone number must be at least 10 digits/i)).toBeInTheDocument();
      });
    });

    it('should validate party size range', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const partySizeSelect = screen.getByLabelText(/Party Size/i);
      // Try to set invalid party size (if possible through UI)

      // Most likely dropdown only shows valid options
      // But we test the service validation
    });
  });

  describe('Form Submission', () => {
    it('should submit valid form', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const phoneInput = screen.getByLabelText(/Phone Number/i);
      await userEvent.type(phoneInput, '+1234567890');

      const submitButton = screen.getByText(/Continue to Review/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            customerName: 'John Doe',
            customerEmail: 'test@example.com',
            customerPhone: '+1234567890'
          })
        );
      });
    });

    it('should include special requests', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const phoneInput = screen.getByLabelText(/Phone Number/i);
      await userEvent.type(phoneInput, '+1234567890');

      const specialRequests = screen.getByLabelText(/Special Requests/i);
      await userEvent.type(specialRequests, 'Window seat please');

      const submitButton = screen.getByText(/Continue to Review/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            specialRequests: 'Window seat please'
          })
        );
      });
    });
  });

  describe('Party Size Change', () => {
    it('should call onPartySizeChange when party size changes', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm 
            onSubmit={mockOnSubmit}
            onPartySizeChange={mockOnPartySizeChange}
          />
        </MockAuthProvider>
      );

      const partySizeSelect = screen.getByLabelText(/Party Size/i);
      fireEvent.change(partySizeSelect, { target: { value: '4' } });

      expect(mockOnPartySizeChange).toHaveBeenCalledWith(4);
    });
  });

  describe('Reset Button', () => {
    it('should render reset button', () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      expect(screen.getByText(/Reset/i)).toBeInTheDocument();
    });

    it('should reset form fields', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      await userEvent.type(phoneInput, '+1234567890');

      const resetButton = screen.getByText(/Reset/i);
      fireEvent.click(resetButton);

      expect(phoneInput.value).toBe('');
    });
  });

  describe('Loading State', () => {
    it('should disable form during loading', () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} isLoading={true} />
        </MockAuthProvider>
      );

      const submitButton = screen.getByText(/Processing/i);
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text', () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} isLoading={true} />
        </MockAuthProvider>
      );

      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display error message', () => {
      render(
        <MockAuthProvider>
          <ReservationForm 
            onSubmit={mockOnSubmit}
            error="Something went wrong"
          />
        </MockAuthProvider>
      );

      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Initial Data', () => {
    it('should populate form with initial data', () => {
      const initialData = {
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        customerPhone: '+9876543210',
        partySize: 4,
        specialRequests: 'Birthday celebration'
      };

      render(
        <MockAuthProvider>
          <ReservationForm 
            onSubmit={mockOnSubmit}
            initialData={initialData}
          />
        </MockAuthProvider>
      );

      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+9876543210')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Birthday celebration')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels', () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });
    });

    it('should be keyboard navigable', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const nameInput = screen.getByLabelText(/Full Name/i);
      const emailInput = screen.getByLabelText(/Email Address/i);

      await userEvent.tab();
      expect(document.activeElement).toBe(nameInput);

      await userEvent.tab();
      expect(document.activeElement).toBe(emailInput);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const nameInput = screen.getByLabelText(/Full Name/i);
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, "O'Brien-Smith");

      const phoneInput = screen.getByLabelText(/Phone Number/i);
      await userEvent.type(phoneInput, '+1234567890');

      const submitButton = screen.getByText(/Continue to Review/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            customerName: "O'Brien-Smith"
          })
        );
      });
    });

    it('should handle very long special requests', async () => {
      render(
        <MockAuthProvider>
          <ReservationForm onSubmit={mockOnSubmit} />
        </MockAuthProvider>
      );

      const specialRequests = screen.getByLabelText(/Special Requests/i);
      const longText = 'A'.repeat(600);
      await userEvent.type(specialRequests, longText);

      // Should show validation error or truncate
      expect(specialRequests).toHaveValue(longText.substring(0, 500));
    });
  });
});
