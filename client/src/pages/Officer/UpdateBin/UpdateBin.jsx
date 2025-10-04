import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import '../../Shared/SharedForm.css';

const UpdateBin = () => {
  const [formData, setFormData] = useState({ binId: '', coordinates: '', area: '' });
  // THE FIX: New state to hold the list of areas
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const { user } = useAuth();

  // THE FIX: This useEffect hook fetches areas when the component loads
  useEffect(() => {
    const fetchAreas = async () => {
      if (user?.city) {
        setLoadingAreas(true);
        try {
          const token = localStorage.getItem('token');
          // Call the new backend endpoint
          const { data } = await axios.get(`/api/areas/${user.city}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAreas(data.data || []);
        } catch (error) {
          console.error("Failed to fetch areas", error);
          toast.error("Could not load areas for your city.");
        } finally {
            setLoadingAreas(false);
        }
      }
    };
    fetchAreas();
  }, [user?.city]); // Re-runs if the user changes

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coordsArray = formData.coordinates.split(',').map(Number);
      if (coordsArray.length !== 2 || isNaN(coordsArray[0]) || isNaN(coordsArray[1])) {
        toast.error("Please enter coordinates in 'Lat, Lng' format.");
        return;
      }
      const payload = { 
          binId: formData.binId,
          area: formData.area,
          coordinates: [coordsArray[1], coordsArray[0]] 
        };
      
      const token = localStorage.getItem('token');
      await axios.post('/api/bins', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('New bin added to the network!');
      setFormData({ binId: '', coordinates: '', area: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add bin.');
    }
  };

  return (
    <div className="form-page-container container">
      <div className="form-card-container">
        <h2>Add New Bin</h2>
        <p>Manage the smart bin network in {user?.city}.</p>
        <form onSubmit={handleSubmit} className="styled-form">
          <div className="form-group">
            <label htmlFor="binId">Bin ID</label>
            <input type="text" name="binId" value={formData.binId} onChange={handleChange} placeholder="e.g., PUNE-KTD-02" required />
          </div>
          
          {/* THE FIX: The dropdown is now populated from the 'areas' state */}
          <div className="form-group">
            <label htmlFor="area">Area</label>
            <select name="area" value={formData.area} onChange={handleChange} required disabled={loadingAreas}>
              <option value="">{loadingAreas ? 'Loading areas...' : '-- Select an Area --'}</option>
              {areas.map(area => (
                <option key={area._id} value={area.name}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="coordinates">GPS Coordinates (Lat, Lng)</label>
            <input type="text" name="coordinates" value={formData.coordinates} onChange={handleChange} placeholder="e.g., 18.5074, 73.8076" required />
          </div>
          <button type="submit" className="btn btn-primary btn-submit">Add Bin to Network</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateBin;