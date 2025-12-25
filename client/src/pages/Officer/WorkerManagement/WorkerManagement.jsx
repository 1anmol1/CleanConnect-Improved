import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import { FaUserPlus, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import AddWorkerModal from '../../../components/Modals/AddWorkerModal.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '../../../assets/workerdash.png';
import './WorkerManagement.css';

// Helper function to check if a date is today
const isToday = (someDate) => {
  if (!someDate) return false;
  const today = new Date();
  const dateToCheck = new Date(someDate);
  return dateToCheck.getDate() === today.getDate() &&
    dateToCheck.getMonth() === today.getMonth() &&
    dateToCheck.getFullYear() === today.getFullYear();
};

const WorkerManagement = () => {
  useScrollToTop();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/users/workers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(data.data);
    } catch (error) {
      // We only show the error toast on the initial load
      if (loading) {
        toast.error("Failed to load worker data.");
      }
      console.error("Failed to fetch workers", error);
    } finally {
      // Only set loading to false on the very first fetch
      if (loading) {
        setLoading(false);
      }
    }
  };

  // --- THE FIX IS HERE ---
  // This useEffect now sets up a "polling" interval to get live updates.
  useEffect(() => {
    // 1. Fetch the data immediately when the page loads.
    fetchWorkers();

    // 2. Then, set up an interval to call fetchWorkers again every 5 seconds.
    const intervalId = setInterval(() => {
      fetchWorkers();
    }, 5000); // 5000 milliseconds = 5 seconds

    // 3. This is a crucial cleanup function. When you navigate away from this page,
    //    it stops the interval to prevent memory leaks and unnecessary API calls.
    return () => clearInterval(intervalId);
  }, []); // The empty array ensures this setup runs only once.

  const handleAddWorker = async (workerData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/users/workers', workerData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('New worker added successfully!');
      setIsModalOpen(false);
      fetchWorkers(); // Immediately refresh the list after adding a new worker
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
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map(worker => (
                <tr key={worker._id}>
                  <td>{worker.name}</td>
                  <td>{worker.area}</td>
                  <td>
                    {isToday(worker.lastCheckIn) ? (
                      <span className="status-badge present">Present</span>
                    ) : (
                      <span className="status-badge absent">Absent</span>
                    )}
                  </td>
                  <td><button className="btn-action"><FaPhone /> Contact</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <AddWorkerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddWorker={handleAddWorker} />
    </>
  );
};

export default WorkerManagement;