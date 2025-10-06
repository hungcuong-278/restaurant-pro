import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ReservationSummary from '../ReservationSummary';
import { TableAvailability } from '../../../types/reservation';

describe('ReservationSummary', () => {
  const baseProps = {
    date: '2025-10-08',
    time: '18:00',
    table: {
      id: 'tbl-1',
      table_number: 'A1',
      capacity: 4,
    } as TableAvailability,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+15551234567',
    partySize: 4,
    specialRequests: 'Window seat',
    restaurantName: 'Golden Fork',
    onEdit: jest.fn(),
    onConfirm: jest.fn(),
    isLoading: false,
    disabled: false,
  };

  it('renders summary information and confirm button enabled by default', () => {
    render(<ReservationSummary {...baseProps} />);

    expect(screen.getByText('Review Your Reservation')).toBeInTheDocument();
    expect(screen.getByText('Confirm Reservation')).toBeEnabled();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(<ReservationSummary {...baseProps} />);

    fireEvent.click(screen.getByText('Confirm Reservation'));

    expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables confirm button when component is loading', () => {
    render(<ReservationSummary {...baseProps} isLoading />);

    expect(screen.getByText('Confirm Reservation')).toBeDisabled();
  });
});