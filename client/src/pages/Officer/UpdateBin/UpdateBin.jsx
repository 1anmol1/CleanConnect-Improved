import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx'; // Assuming you might want a loader
import '../../Shared/SharedForm.css'; // Assuming you have shared form styles

const UpdateBin = () => {
  const [formData, setFormData] = useState({ binId: '', coordinates: '', area: '' });
  const [areas, setAreas] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAreas = async () => {
      if (user?.city) {
        try {
          const token = localStorage.getItem('token');
          // Assuming API returns an array of area objects like [{ name: 'Kothrud' }]
          const { data } = await axios.get(`/api/areas/${user.city}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Extract just the names for the dropdown
          setAreas(data.data.map(area => area.name) || []);
        } catch (error) {
          console.error("Failed to fetch areas", error);
          toast.error("Could not load areas for your city.");
        }
      }
    };
    fetchAreas();
  }, [user?.city]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const coordsArray = formData.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (coordsArray.length !== 2 || isNaN(coordsArray[0]) || isNaN(coordsArray[1])) {
        toast.error("Please enter coordinates in 'Latitude, Longitude' format.");
        return;
      }
      
      const payload = { 
          binId: formData.binId,
          area: formData.area,
          // GeoJSON format is [Longitude, Latitude]
          coordinates: [coordsArray[1], coordsArray[0]] 
        };
      
      const token = localStorage.getItem('token');
      await axios.post('/api/bins', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('New bin added to the network!');
      setFormData({ binId: '', coordinates: '', area: '' }); // Reset form
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
          <div className="form-group">
            <label htmlFor="area">Area</label>
            <select name="area" value={formData.area} onChange={handleChange} required>
              <option value="">-- Select an Area --</option>
              {areas.map(areaName => <option key={areaName} value={areaName}>{areaName}</option>)}
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
