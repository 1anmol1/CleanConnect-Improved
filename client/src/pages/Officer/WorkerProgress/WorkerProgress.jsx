import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaChartLine, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../hooks/useAuth.js';
import Loader from '../../../components/Loader/Loader.jsx';
import './WorkerProgress.css';

// Custom Tooltip for the chart - No changes here
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Report #${label}`}</p>
        <p className="intro">{`Time: ${payload[0].value.toFixed(0)} minutes`}</p>
        <p className="desc">{`Issue: ${payload[0].payload.issueType}`}</p>
      </div>
    );
  }
  return null;
};

const WorkerProgress = () => {
  useScrollToTop();
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false); // <-- NEW STATE

  // This effect checks if the Recharts library is loaded
  useEffect(() => {
    const checkRecharts = () => {
      if (window.Recharts) {
        setIsChartReady(true);
      } else {
        setTimeout(checkRecharts, 100); // Check again in 100ms
      }
    };
    checkRecharts();
  }, []);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('/complaints/progress', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPerformanceData(data.data);
        if (data.data.length > 0) {
          setSelectedWorker(data.data[0]);
        }
      } catch (error) {
        toast.error('Failed to load worker performance data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPerformance();
    }
  }, [user]);

  // If the chart library is ready, destructure the components
  const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = isChartReady ? window.Recharts : {};

  const chartData = selectedWorker ? selectedWorker.resolutions.map((res, index) => ({
    name: index + 1,
    time: res.resolutionTimeMinutes,
    issueType: res.issueType,
  })) : [];

  if (loading) {
    return <Loader text="Analyzing worker performance data..." />;
  }

  return (
    <div className="worker-progress-page container fade-in">
      <header className="page-header">
        <h1><FaChartLine /> Worker Efficiency Report</h1>
        <p>Rankings and performance analytics for workers in {user?.city}.</p>
      </header>

      {performanceData.length === 0 ? (
        <div className="card no-data-message">
          <FaInfoCircle />
          <p>No resolved complaints found to generate a performance report.</p>
        </div>
      ) : (
        <div className="performance-layout">
          <div className="chart-container card">
            <h3>Individual Performance: {selectedWorker?.workerName}</h3>
            {isChartReady ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" label={{ value: 'Report Number', position: 'insideBottom', offset: -5 }} />
                  <YAxis label={{ value: 'Time (Minutes)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="time" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div>Loading Chart...</div> // Fallback message
            )}
          </div>

          <div className="progress-table-container card">
            <h3>Worker Rankings</h3>
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Worker Name</th>
                  <th>Complaints Solved</th>
                  <th>Avg. Resolution Time</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((worker, index) => (
                  <tr 
                    key={worker.workerId} 
                    className={selectedWorker?.workerId === worker.workerId ? 'selected' : ''}
                    onClick={() => setSelectedWorker(worker)}
                  >
                    <td>{index + 1}</td>
                    <td>{worker.workerName}</td>
                    <td>{worker.complaintsSolved}</td>
                    <td className="resolution-time">{worker.averageResolutionTime.toFixed(0)} mins</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerProgress;