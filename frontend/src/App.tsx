import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RestaurantsPage from './pages/RestaurantsPage';
import BookingPage from './pages/BookingPage';
import MenuPage from './pages/MenuPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';

import './styles/index.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-white">
          <Header />
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
              
              {/* Admin Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </Provider>
  );
};

export default App;