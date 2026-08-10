import React, { useState, useEffect, useRef } from 'react';
import useScrollToTop from '../../hooks/useScrollToTop';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
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
  const [workers, setWorkers] = useState([]);
  const [citizens, setCitizens] = useState([]); // <-- NEW: State for citizens
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedCitizenEmail, setSelectedCitizenEmail] = useState(''); // <-- NEW: State for citizen dropdown

  const [serverStatus, setServerStatus] = useState('checking');
  const [countdown, setCountdown] = useState(50);

  const navigate = useNavigate();
  const { login } = useAuth();
  const formRef = useRef();

  useEffect(() => {
    let timer;
    const fetchInitialData = async () => {
      try {
        // If the request takes longer than 1.5s, assume Render is spinning up
        const wakeTimeout = setTimeout(() => {
          setServerStatus('waking');
          timer = setInterval(() => {
            setCountdown(prev => (prev > 0 ? prev - 1 : 0));
          }, 1000);
        }, 1500);

        const [citiesRes, workersRes, citizensRes] = await Promise.all([
          axios.get('/areas/cities'),
          axios.get('/users/all-workers'),
          axios.get('/users/all-citizens')
        ]);
        
        clearTimeout(wakeTimeout);
        if (timer) clearInterval(timer);
        setServerStatus('online');

        setCities(citiesRes.data.data);
        setWorkers(workersRes.data.data);
        setCitizens(citizensRes.data.data);

        if (workersRes.data.data.length > 0) {
          setSelectedWorkerId(workersRes.data.data[0].workerId);
        }
        if (citizensRes.data.data.length > 0) {
          setSelectedCitizenEmail(citizensRes.data.data[0].email);
        }
      } catch (error) {
        setServerStatus('error');
        console.error("Failed to fetch initial login data", error);
      }
    };
    fetchInitialData();
    return () => { if (timer) clearInterval(timer); };
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLocationChange = async (e) => {
    const term = e.target.value;
    setFormData({ ...formData, location: term });
    if (term.length >= 3) {
      try {
        const { data } = await axios.get(`/areas/search?term=${term}`);
        if (data.success) setLocationSuggestions(data.data);
      } catch (error) { setLocationSuggestions([]); }
    } else {
      setLocationSuggestions([]);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const url = isLoginView ? '/auth/login' : '/auth/register';
    
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
    setTimeout(() => formRef.current.requestSubmit(), 0);
  };
  
  const handleWorkerDropdownLogin = () => {
    if (!selectedWorkerId) return;
    handleQuickLogin('Worker', { workerId: selectedWorkerId, password: 'password123' });
  };

  const handleCitizenDropdownLogin = () => {
    if (!selectedCitizenEmail) return;
    handleQuickLogin('Citizen', { email: selectedCitizenEmail, password: 'password123' });
  };

  return (
    <div className="login-page-container">
      <div className="form-container">
        
        {/* Server Status Banner */}
        {serverStatus === 'waking' && (
          <div className="server-status-banner warning">
            <strong>Server is waking up!</strong> Please allow up to {countdown} seconds for the free backend to start.
          </div>
        )}
        {serverStatus === 'online' && (
          <div className="server-status-banner success">
            <strong>Server Online!</strong> Fast login available.
          </div>
        )}

        <div className="form-card" style={{marginTop: '1rem'}}>
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
            <button type="submit" className="btn btn-primary btn-block" disabled={serverStatus === 'waking'}>{isLoginView ? 'Login' : 'Sign Up'}</button>
          </form>

          {activeRole === 'Citizen' && (<div className="toggle-text">{isLoginView ? "Don't have an account?" : "Already have an account?"}<button type="button" onClick={() => setIsLoginView(!isLoginView)} className="toggle-button">{isLoginView ? 'Sign Up' : 'Login'}</button></div>)}
          {(activeRole === 'Worker' || activeRole === 'Officer') && isLoginView && (<div className="toggle-text">For login assistance, please contact your administration.</div>)}
        </div>
        
        {isLoginView && (
          <div className="quick-login-section">
            <p className="quick-login-title" style={{color: '#ff4d4f', fontSize: '1.1rem'}}>
              <strong>Please use the given test options below for a quick login!</strong>
            </p>
            
            <div className="citizen-login-dropdown">
              <select value={selectedCitizenEmail} onChange={(e) => setSelectedCitizenEmail(e.target.value)} disabled={serverStatus === 'waking' || citizens.length === 0}>
                {citizens.length === 0 ? <option>Loading test accounts...</option> : citizens.map(citizen => (
                  <option key={citizen.email} value={citizen.email}>
                    {citizen.name}
                  </option>
                ))}
              </select>
              <button onClick={handleCitizenDropdownLogin} disabled={serverStatus === 'waking' || citizens.length === 0}>Login as Citizen</button>
            </div>

            <div className="worker-login-dropdown" style={{marginTop: '10px'}}>
              <select value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)} disabled={serverStatus === 'waking' || workers.length === 0}>
                {workers.length === 0 ? <option>Loading test workers...</option> : workers.map(worker => (
                  <option key={worker.workerId} value={worker.workerId}>
                    {worker.name} ({worker.workerId})
                  </option>
                ))}
              </select>
              <button onClick={handleWorkerDropdownLogin} disabled={serverStatus === 'waking' || workers.length === 0}>Login as Worker</button>
            </div>

            <div className="quick-login-buttons" style={{marginTop: '10px'}}>
              <button onClick={() => handleQuickLogin('Officer', { city: 'Pune', password: 'password123' })} disabled={serverStatus === 'waking'}>Login as Priya (Officer)</button>
            </div>
          </div>
        )}
        
        <div className="public-reports-section">
          <Link to="/officer-progress" className="btn btn-secondary btn-block">
            View Officer Progress Report
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;