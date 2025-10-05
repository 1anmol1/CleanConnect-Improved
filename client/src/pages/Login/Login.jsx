import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../hooks/useScrollToTop';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { toast } from 'react-toastify';
import './Login.css';

const Login = () => {
  useScrollToTop();
  const [isLoginView, setIsLoginView] = useState(true);
  const [activeRole, setActiveRole] = useState('Citizen');
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', 
    addressLine: '', location: '', workerId: '', officerId: '', city: ''
  });
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [cities, setCities] = useState([]);
  
  const navigate = useNavigate();
  const { login } = useAuth();
  const formRef = React.useRef();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const { data } = await axios.get('/api/areas/cities');
        setCities(data.data);
      } catch (error) { console.error("Failed to fetch cities", error); }
    };
    fetchCities();
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLocationChange = async (e) => {
    const term = e.target.value;
    setFormData({ ...formData, location: term });
    if (term.length >= 3) {
      try {
        const { data } = await axios.get(`/api/areas/search?term=${term}`);
        if (data.success) setLocationSuggestions(data.data);
      } catch (error) { setLocationSuggestions([]); }
    } else {
      setLocationSuggestions([]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const url = isLoginView ? '/api/auth/login' : '/api/auth/register';
    
    let payload = { role: activeRole };
    if (isLoginView) {
        if (activeRole === 'Citizen') payload = { ...payload, email: formData.email, password: formData.password };
        if (activeRole === 'Worker') payload = { ...payload, workerId: formData.workerId, password: formData.password };
        if (activeRole === 'Officer') payload = { ...payload, city: formData.city, password: formData.password };
    } else {
        payload = { ...formData, role: 'Citizen' };
    }
    
    try {
      const { data } = await axios.post(url, payload);
      login(data);
      toast.success(`Welcome, ${data.user.name}!`);
      navigate(`/${activeRole.toLowerCase()}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred.');
    }
  };
  
  const setRole = (role) => {
    setActiveRole(role);
    if (role === 'Worker' || role === 'Officer') {
      setIsLoginView(true);
    }
  };

  const handleQuickLogin = (role, credentials) => {
    setActiveRole(role);
    setFormData(prev => ({ ...prev, ...credentials }));
    setTimeout(() => {
        formRef.current.requestSubmit();
    }, 0);
  };

  return (
    <div className="login-page-container">
      <div className="form-container">
        <div className="form-card">
          <div className="role-selector">
            <button onClick={() => setRole('Citizen')} className={activeRole === 'Citizen' ? 'active' : ''}>Citizen</button>
            <button onClick={() => setRole('Worker')} className={activeRole === 'Worker' ? 'active' : ''}>Worker</button>
            <button onClick={() => setRole('Officer')} className={activeRole === 'Officer' ? 'active' : ''}>Officer</button>
          </div>

          <h2>{isLoginView ? 'Welcome Back' : 'Create Citizen Account'}</h2>
          <p>{isLoginView ? 'Log in to access your portal.' : 'Sign up to report issues and earn rewards.'}</p>
          
          <form onSubmit={onSubmit} ref={formRef}>
            {!isLoginView && <div className="form-group"><label>Full Name</label><input type="text" name="name" value={formData.name} placeholder="e.g., Anmol Patil" onChange={onChange} required /></div>}
            {(activeRole === 'Citizen') && <div className="form-group"><label>Email Address</label><input type="email" name="email" value={formData.email} placeholder="e.g., user@example.com" onChange={onChange} required /></div>}
            {(activeRole === 'Worker' && isLoginView) && <div className="form-group"><label>Worker ID</label><input type="text" name="workerId" value={formData.workerId} placeholder="e.g., WKR-PUNE-01" onChange={onChange} required /></div>}
            {(activeRole === 'Officer' && isLoginView) && <div className="form-group"><label>City</label><select name="city" value={formData.city} onChange={onChange} required><option value="">Select Your City</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}</select></div>}
            {!isLoginView && (
              <>
                <div className="form-group"><label>Address Line 1</label><input type="text" name="addressLine" value={formData.addressLine} placeholder="Flat No, Building Name, Street" onChange={onChange} required /></div>
                <div className="form-group"><label>Area, City</label><input type="text" name="location" value={formData.location} onChange={handleLocationChange} placeholder="Start typing your Area..." list="location-suggestions" required /><datalist id="location-suggestions">{locationSuggestions.map(loc => <option key={loc} value={loc} />)}</datalist></div>
              </>
            )}
            <div className="form-group"><label>Password</label><input type="password" name="password" value={formData.password} placeholder="Enter your password" onChange={onChange} required /></div>
            <button type="submit" className="btn btn-primary btn-block">{isLoginView ? 'Login' : 'Sign Up'}</button>
          </form>

          {activeRole === 'Citizen' && (<div className="toggle-text">{isLoginView ? "Don't have an account?" : "Already have an account?"}<button type="button" onClick={() => setIsLoginView(!isLoginView)} className="toggle-button">{isLoginView ? 'Sign Up' : 'Login'}</button></div>)}
          {(activeRole === 'Worker' || activeRole === 'Officer') && isLoginView && (<div className="toggle-text">For login assistance, please contact your administration.</div>)}
        </div>
        
        {/* EDITED: Restructured quick login section */}
        {isLoginView && (
          <div className="quick-login-section">
            <p className="quick-login-title">For Demonstration (Pune Logins)</p>
            <div className="quick-login-buttons">
              <button onClick={() => handleQuickLogin('Citizen', { email: 'citizen.pune@test.com', password: 'password123' })}>Citizen 1 (Anjali)</button>
              <button onClick={() => handleQuickLogin('Worker', { workerId: 'WKR-PUNE-01', password: 'password123' })}>Worker 1 (Suresh)</button>
              <button onClick={() => handleQuickLogin('Officer', { city: 'Pune', password: 'password123' })}>Officer (Priya)</button>
            </div>
            
            <p className="quick-login-title">For Demonstration (Other City Logins)</p>
            <div className="quick-login-buttons">
              <button onClick={() => handleQuickLogin('Citizen', { email: 'citizen.kop@test.com', password: 'password123' })}>Citizen 2 (Rohan)</button>
              <button onClick={() => handleQuickLogin('Worker', { workerId: 'WKR-MUM-01', password: 'password123' })}>Worker 2 (Amit)</button>
              <button onClick={() => handleQuickLogin('Officer', { city: 'Mumbai', password: 'password123' })}>Officer 2 (Vikram)</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;