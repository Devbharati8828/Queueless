import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QueueProvider } from './context/QueueContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Landing from './pages/Landing';
import JoinQueue from './pages/JoinQueue';
import QueueStatus from './pages/QueueStatus';
import ProviderDashboard from './pages/ProviderDashboard';
import CreateQueue from './pages/CreateQueue';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import About from './pages/About';
import History from './pages/History';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueueProvider>
          <ToastProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/join" element={<JoinQueue />} />
                <Route path="/queue-status" element={<QueueStatus />} />
                <Route path="/about" element={<About />} />
                <Route path="/history" element={<History />} />
                <Route path="/profile" element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="provider"><ProviderDashboard /></ProtectedRoute>
                } />
                <Route path="/create-queue" element={
                  <ProtectedRoute requiredRole="provider"><CreateQueue /></ProtectedRoute>
                } />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Layout />}>
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ToastProvider>
        </QueueProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
