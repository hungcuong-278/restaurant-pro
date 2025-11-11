import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginNotification from './components/LoginNotification';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import BookingPage from './pages/BookingPage';
import MenuPage from './pages/MenuPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';
import SimpleReservationPage from './pages/reservations/SimpleReservationPage';
import ReservationPage from './pages/reservations/ReservationPage';
import ReservationConfirmationPage from './pages/reservations/ReservationConfirmationPage';
import MyReservationsPage from './pages/reservations/MyReservationsPage';
import OrderListPage from './pages/orders/OrderListPage';
import NewOrderPage from './pages/orders/NewOrderPage';
import OrderDetailsPage from './pages/orders/OrderDetailsPage';
import KitchenViewPage from './pages/orders/KitchenViewPage';
import PaymentPage from './pages/PaymentPage';
import PaymentProcessingPage from './pages/PaymentProcessingPage';

import './styles/index.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <Header />
              <LoginNotification />
              <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurants" element={<RestaurantsPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Reservation Routes */}
              <Route path="/reservations" element={<SimpleReservationPage />} />
              <Route path="/reservations/new" element={<ReservationPage />} />
              <Route path="/reservations/confirmation/:reservationId" element={<ReservationConfirmationPage />} />
              <Route path="/reservations/my-reservations" element={<MyReservationsPage />} />
              
              {/* Admin Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Order Management Routes */}
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/new" element={<NewOrderPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
              <Route path="/kitchen" element={<KitchenViewPage />} />`n              `n              {/* Payment Route */}`n              <Route path="/payment" element={<PaymentPage />} />`n              <Route path="/payment/process" element={<PaymentProcessingPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
        </ToastProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;


