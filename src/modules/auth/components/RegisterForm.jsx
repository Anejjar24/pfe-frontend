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
import { registerUser, clearError, selectAuthError, selectAuthLoading } from '../../../store/slices/authSlice';

export default function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const error = useSelector(selectAuthError);
  const isLoading = useSelector(selectAuthLoading);

  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      alert('Passwords do not match');
      return;
    }

    const result = await dispatch(
      registerUser({
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
      })
    );
    if (registerUser.fulfilled.match(result)) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="login-form">
      <h2 className="mb-4 text-center">Create Account</h2>

      {error && <Alert color="danger" className="mb-3">{error}</Alert>}

      <FormGroup>
        <Label for="firstname">First Name</Label>
        <Input
          type="text"
          name="firstname"
          id="firstname"
          placeholder="First name"
          value={formData.firstname}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label for="lastname">Last Name</Label>
        <Input
          type="text"
          name="lastname"
          id="lastname"
          placeholder="Last name"
          value={formData.lastname}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label for="email">Email Address</Label>
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
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
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </FormGroup>

      <FormGroup>
        <Label for="passwordConfirm">Confirm Password</Label>
        <Input
          type="password"
          name="passwordConfirm"
          id="passwordConfirm"
          placeholder="Confirm password"
          value={formData.passwordConfirm}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
      </FormGroup>

      <Button color="primary" block disabled={isLoading} className="mb-3">
        {isLoading ? <>
          <Spinner size="sm" className="me-2" />
          Creating...
        </> : 'Create Account'}
      </Button>

      <div className="text-center">
        <p className="text-muted mb-0">
          Already have an account?{' '}
          <Link to="/auth/login" className="text-primary">
            Login here
          </Link>
        </p>
      </div>
    </Form>
  );
}
