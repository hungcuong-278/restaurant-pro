import reducer, {
  clearSelection,
  nextStep,
  previousStep,
  setCurrentStep,
  setSelectedDate,
  setSelectedTable,
  setSelectedTime,
} from '../reservationSlice';
import { ReservationState } from '../reservationSlice';

describe('reservationSlice', () => {
  const createState = (overrides: Partial<ReservationState> = {}): ReservationState => ({
    reservations: [],
    currentReservation: null,
    availableTables: [],
    currentStep: 'datetime',
    selectedDate: null,
    selectedTime: null,
    selectedTable: null,
    partySize: 2,
    loading: false,
    isLoading: false,
    isCheckingAvailability: false,
    isCreatingReservation: false,
    error: null,
    availabilityError: null,
    success: null,
    ...overrides,
  });

  it('should progress from details to review step', () => {
    const initialState = createState({ currentStep: 'details' });

    const nextState = reducer(initialState, nextStep());

    expect(nextState.currentStep).toBe('review');
  });

  it('should not go past review step when calling nextStep', () => {
    const initialState = createState({ currentStep: 'review' });

    const nextState = reducer(initialState, nextStep());

    expect(nextState.currentStep).toBe('review');
  });

  it('should move backwards in the flow with previousStep', () => {
    const initialState = createState({ currentStep: 'table' });

    const prevState = reducer(initialState, previousStep());

    expect(prevState.currentStep).toBe('datetime');
  });

  it('should reset state when calling clearSelection', () => {
    const initialState = createState({
      currentStep: 'review',
      selectedDate: '2025-10-08',
      selectedTime: '18:00',
      selectedTable: { id: '1', table_number: '5', capacity: 4 } as any,
      partySize: 4,
      availabilityError: 'No tables',
    });

    const nextState = reducer(initialState, clearSelection());

    expect(nextState).toMatchObject({
      currentStep: 'datetime',
      selectedDate: null,
      selectedTime: null,
      selectedTable: null,
      partySize: 2,
      availabilityError: null,
    });
  });

  it('should set individual selections correctly', () => {
    const initialState = createState();

    const withDate = reducer(initialState, setSelectedDate('2025-10-08'));
    expect(withDate.selectedDate).toBe('2025-10-08');

    const withTime = reducer(withDate, setSelectedTime('18:00'));
    expect(withTime.selectedTime).toBe('18:00');

    const table = { id: 'tbl-1', table_number: 'A1', capacity: 2 } as any;
    const withTable = reducer(withTime, setSelectedTable(table));
    expect(withTable.selectedTable).toEqual(table);

    const reviewState = reducer(withTable, setCurrentStep('review'));
    expect(reviewState.currentStep).toBe('review');
  });
});