import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import Loader from '../../../components/Loader/Loader.jsx';
import './OfficerProgress.css';

// The 'recharts' imports and the 'CustomTooltip' component have been completely removed.

const OfficerProgress = () => {
  useScrollToTop();
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  // The 'selectedOfficer' state is no longer needed as there is no chart to update.

  // Fetch Officer Performance Data (this logic remains the same)
  useEffect(() => {
    const fetchOfficerProgress = async () => {
      try {
        const { data } = await axios.get('/complaints/officer-progress');
        const officers = Array.isArray(data?.data) ? data.data : [];
        setPerformanceData(officers);
      } catch (error) {
        toast.error('Failed to load the officer progress report.');
        console.error('Failed to fetch officer progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficerProgress();
  }, []);

  // The 'chartData' mapping logic has been removed.

  if (loading) {
    return <Loader text="Generating public officer accountability report..." />;
  }

  return (
    <div className="officer-progress-page container fade-in">
      {/* HEADER */}
      <header className="page-header">
        <h1><FaShieldAlt /> Officer Accountability Report</h1>
        <p>This public report shows complaint resolution times across all cities.</p>
      </header>

      {/* NO DATA MESSAGE */}
      {performanceData.length === 0 ? (
        <div className="card no-data-message">
          <FaInfoCircle />
          <p>No fully resolved complaints are available to generate a report yet.</p>
        </div>
      ) : (
        // The layout is now simplified to only contain the table.
        <div className="progress-table-container card">
          <h3>Officer Rankings by Average Resolution Time</h3>
          <table className="progress-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Officer Name</th>
                <th>City</th>
                <th>Complaints Verified</th>
                <th>Avg. Total Time</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((officer, index) => (
                <tr key={officer.officerId || index}>
                  <td>{index + 1}</td>
                  <td>{officer.officerName || 'Unknown'}</td>
                  <td>{officer.city || 'N/A'}</td>
                  <td>{officer.complaintsVerified ?? 0}</td>
                  <td className="resolution-time">
                    {typeof officer.averageTotalTime === 'number'
                      ? `${officer.averageTotalTime.toFixed(0)} mins`
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OfficerProgress;