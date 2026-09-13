import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetail from './pages/ListingDetail';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetail from './pages/ProjectDetail';
import RentalsPage from './pages/RentalsPage';
import RentalDetail from './pages/RentalDetail';
import FavouritesPage from './pages/FavouritesPage';

// Simple protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Authenticating...</div>;
  if (!user) return <Navigate to="/" />;
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* Protected Dashboard Routes */}
          <Route path="/listings" element={<ProtectedRoute><ListingsPage /></ProtectedRoute>} />
          <Route path="/listings/:id" element={<ProtectedRoute><ListingDetail /></ProtectedRoute>} />
          
          <Route path="/projects" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          
          <Route path="/rentals" element={<ProtectedRoute><RentalsPage /></ProtectedRoute>} />
          <Route path="/rentals/:id" element={<ProtectedRoute><RentalDetail /></ProtectedRoute>} />
          
          <Route path="/favourites" element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} /> 
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}