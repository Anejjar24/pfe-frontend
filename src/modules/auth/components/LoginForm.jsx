import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Spinner,
} from 'reactstrap';
import { loginUser, clearError, selectAuthError, selectAuthLoading } from '../../../store/slices/authSlice';
import './LoginForm.css';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    const result = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(result)) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="login-form">
      <h2 className="mb-4 text-center">Login to AquaFlow</h2>

      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <FormGroup>
        <Label for="email">Email Address</Label>
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label for="password">Password</Label>
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </FormGroup>

      <Button
        color="primary"
        block
        disabled={isLoading}
        className="mb-3"
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className="me-2" />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </Button>

      <div className="text-center">
        <p className="text-muted mb-0">
          Don't have an account?{' '}
          <Link to="/auth/register" className="text-primary">
            Register here
          </Link>
        </p>
      </div>
    </Form>
  );
}
