import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import Loader from '../../../components/Loader/Loader.jsx';
import './OfficerProgress.css';

const OfficerProgress = () => {
  useScrollToTop();
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficerProgress = async () => {
      try {
        const { data } = await axios.get('/api/complaints/officer-progress');
        setReportData(data.data);
      } catch (error) {
        toast.error('Failed to load the officer progress report.');
        console.error('Failed to fetch officer progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficerProgress();
  }, []);

  if (loading) {
    return <Loader text="Generating public officer accountability report..." />;
  }

  return (
    <div className="officer-progress-page container fade-in">
      <header className="page-header">
        <h1><FaShieldAlt /> Officer Accountability Report</h1>
        <p>This report shows the time taken from complaint creation to final resolution notification.</p>
      </header>

      <div className="progress-table-container card">
        {reportData.length === 0 ? (
          <div className="no-data-message">
            <FaInfoCircle />
            <p>No fully resolved complaints are available to generate a report yet.</p>
          </div>
        ) : (
          <table className="progress-table">
            <thead>
              <tr>
                <th>Officer Name</th>
                <th>City</th>
                <th>Issue Type</th>
                <th>Time to Assign</th>
                <th>Total Resolution Time</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item) => (
                <tr key={item._id}>
                  <td>{item.officerName}</td>
                  <td>{item.city}</td>
                  <td>{item.issueType}</td>
                  <td className="resolution-time">{item.assignmentTime}</td>
                  <td className="resolution-time">{item.totalTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OfficerProgress;