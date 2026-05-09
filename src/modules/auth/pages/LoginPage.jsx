import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { selectIsAuthenticated } from '../../../store/slices/authSlice';
import LoginForm from '../components/LoginForm';
import './AuthPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-page">
      
            <LoginForm />
        
    </div>
  );
}
