import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaChartLine, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import './WorkerProgress.css';

const WorkerProgress = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/api/complaints/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProgressData(data.data);
      } catch (error) {
        toast.error('Failed to load worker progress data.');
        console.error('Failed to fetch progress:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProgress();
    }
  }, [user]);

  if (loading) {
    return <Loader text="Generating worker progress report..." />;
  }

  return (
    <div className="worker-progress-page container fade-in">
      <header className="page-header">
        <h1><FaChartLine /> Worker Efficiency Report</h1>
        <p>Reviewing resolution times for complaints in {user?.city}.</p>
      </header>

      <div className="progress-table-container card">
        {progressData.length === 0 ? (
          <div className="no-data-message">
            <FaInfoCircle />
            <p>No resolved complaints found to generate a progress report.</p>
          </div>
        ) : (
          <table className="progress-table">
            <thead>
              <tr>
                <th>Worker Name</th>
                <th>Issue Type</th>
                <th>Bin ID</th>
                <th>Assigned On</th>
                <th>Resolved On</th>
                <th>Time to Resolve</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((item) => (
                <tr key={item._id}>
                  <td>{item.workerName}</td>
                  <td>{item.issueType}</td>
                  <td>{item.binId || 'N/A'}</td>
                  <td>{new Date(item.assignedAt).toLocaleString()}</td>
                  <td>{new Date(item.resolvedAt).toLocaleString()}</td>
                  <td className="resolution-time">{item.resolutionTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default WorkerProgress;