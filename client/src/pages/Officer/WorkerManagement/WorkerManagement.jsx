import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import AddWorkerModal from '../../../components/Modals/AddWorkerModal.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '../../../assets/workerdash.png';
import './WorkerManagement.css';

const WorkerManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/users/workers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(data.data);
    } catch (error) {
      console.error("Failed to fetch workers", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  // EDITED: This function now handles the API call
  const handleAddWorker = async (workerData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/users/workers', workerData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('New worker added successfully!');
      setIsModalOpen(false);
      fetchWorkers(); // Refresh the list of workers
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add worker.');
    }
  };
    if (loading) {
    return <Loader text="Loading worker data..." />;
  }

  return (
    <>
      <div className="worker-management-page container fade-in">
        <header 
          className="page-header"
          style={{ backgroundImage: `url(${dashboardHeroImage})` }}
        >
          <h1>Worker Management</h1>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <FaUserPlus /> Add New Worker
          </button>
        </header>
        <div className="worker-table-container card">
          <table className="worker-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Assigned Area</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(worker => (
                <tr key={worker._id}>
                  <td>{worker.name}</td>
                  <td>{worker.area}</td>
                  <td><button className="btn-action"><FaPhone /> Contact</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pass the real handler function to the modal */}
      <AddWorkerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddWorker={handleAddWorker} />
    </>
  );
};

export default WorkerManagement;