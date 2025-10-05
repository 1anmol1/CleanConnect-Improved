import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import ResolveComplaintModal from '../../../components/Modals/ResolveComplaintModal.jsx';
import Loader from '../../../components/Loader/Loader.jsx';
import dashboardHeroImage from '/src/assets/resolution.png';
import './Resolutions.css';

const Resolutions = () => {
  useScrollToTop();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchResolutions = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/complaints/my-resolutions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(data.data);
    } catch (error) {
      // THE FIX: This now provides a clear, user-facing error message.
      toast.error(error.response?.data?.error || "Could not load your assigned tasks.");
      console.error("Failed to fetch resolutions", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResolutions();
  }, []);

  const openResolveModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleResolveSubmit = async (taskId, photo) => {
    const formData = new FormData();
    formData.append('resolutionPhoto', photo);

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/complaints/${taskId}/resolve`, formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
        }
      });
      toast.success('Task marked as resolved with proof!');
      setIsModalOpen(false);
      fetchResolutions(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to resolve task.');
    }
  };

  if (loading) return <Loader text="Loading assigned resolutions..." />;

  return (
    <>
      <div className="resolutions-page container fade-in">
        <header 
          className="page-header"
          style={{ backgroundImage: `url(${dashboardHeroImage})` }}
        >
          <h1>Assigned Resolutions</h1>
          <p>View and manage tasks assigned to you by the officer.</p>
        </header>
        <div className="tasks-list">
          {tasks.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <p>No tasks assigned to you at the moment.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task._id} className="task-card card">
                <div className={`status-icon ${task.status.toLowerCase()}`}>
                  {task.status === 'Resolved' ? <FaCheckCircle /> : <FaExclamationCircle />}
                </div>
                <div className="task-details">
                  <div className="task-info">
                    <span className="task-issue-type">{task.issueType}</span>
                    {task.binId && <span className="task-bin-id">Bin ID: {task.binId}</span>}
                  </div>
                  <p className="task-description">{task.description || 'No specific description provided.'}</p>
                  <span className={`status-text ${task.status.toLowerCase()}`}>{task.status}</span>
                </div>
                {task.status !== 'Resolved' && (
                  <button 
                    onClick={() => openResolveModal(task)} 
                    className="btn btn-primary"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ResolveComplaintModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleResolveSubmit}
        task={selectedTask}
      />
    </>
  );
};

export default Resolutions;