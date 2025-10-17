import React, { useState, useEffect } from 'react';
import useScrollToTop from '../../../hooks/useScrollToTop';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import Loader from '../../../components/Loader/Loader.jsx';
import './OfficerProgress.css';

// ✅ Proper Recharts imports
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// ✅ Custom Tooltip for Chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Complaint #${label}`}</p>
        <p className="intro">{`Total Time: ${payload[0].value.toFixed(0)} minutes`}</p>
        <p className="desc">{`Issue: ${payload[0].payload.issueType || 'Unknown'}`}</p>
      </div>
    );
  }
  return null;
};

const OfficerProgress = () => {
  useScrollToTop();
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOfficer, setSelectedOfficer] = useState(null);

  // ✅ Fetch Officer Performance Data
  useEffect(() => {
    const fetchOfficerProgress = async () => {
      try {
        const { data } = await axios.get('/api/complaints/officer-progress');
        const officers = Array.isArray(data?.data) ? data.data : [];

        setPerformanceData(officers);
        if (officers.length > 0) setSelectedOfficer(officers[0]);
      } catch (error) {
        toast.error('Failed to load the officer progress report.');
        console.error('Failed to fetch officer progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOfficerProgress();
  }, []);

  // ✅ Safely map chart data
  const chartData =
    selectedOfficer?.resolutions?.length > 0
      ? selectedOfficer.resolutions.map((res, index) => ({
          name: index + 1,
          time: typeof res.totalResolutionTimeMinutes === 'number'
            ? res.totalResolutionTimeMinutes
            : 0,
          issueType: res.issueType || 'Unknown',
        }))
      : [];

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

      {/* NO DATA */}
      {performanceData.length === 0 ? (
        <div className="card no-data-message">
          <FaInfoCircle />
          <p>No fully resolved complaints are available to generate a report yet.</p>
        </div>
      ) : (
        <div className="performance-layout">
          
          {/* CHART CARD */}
          <div className="chart-container card">
            <h3>
              Individual Performance: {selectedOfficer?.officerName || 'N/A'} (
              {selectedOfficer?.city || 'N/A'})
            </h3>

            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    label={{
                      value: 'Complaint Number',
                      position: 'insideBottom',
                      offset: -5,
                    }}
                  />
                  <YAxis
                    label={{
                      value: 'Total Time (Minutes)',
                      angle: -90,
                      position: 'insideLeft',
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="time"
                    name="Total Resolution Time"
                    stroke="#17a2b8"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data-message">
                <FaInfoCircle />
                <p>No individual complaint data to display for this officer.</p>
              </div>
            )}
          </div>

          {/* TABLE CARD */}
          <div className="progress-table-container card">
            <h3>Officer Rankings</h3>
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
                  <tr
                    key={officer.officerId || index}
                    className={
                      selectedOfficer?.officerId === officer.officerId ? 'selected' : ''
                    }
                    onClick={() => setSelectedOfficer(officer)}
                  >
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
        </div>
      )}
    </div>
  );
};

export default OfficerProgress;
