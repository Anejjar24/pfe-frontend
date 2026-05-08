import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'reactstrap';
import { selectIsAuthenticated } from '../../../store/slices/authSlice';
import RegisterForm from '../components/RegisterForm';
import './AuthPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="auth-page">
      <Container>
        <Row className="vh-100 align-items-center">
          <Col md="6" lg="5" className="mx-auto">
            <div className="auth-header mb-4">
              <h1 className="text-center mb-2">AquaFlow</h1>
              <p className="text-center text-muted">
                Industrial Water Station Supervision
              </p>
            </div>
            <RegisterForm />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
