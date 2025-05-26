import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  createWeatherHistory,
  getWeatherHistory,
  updateWeatherHistory,
  deleteWeatherHistory
} from '../../api/weatherHistory';
import './WeatherHistory.css';

const WeatherHistory = ({ storage }) => {
  const [weatherRecords, setWeatherRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  const [formData, setFormData] = useState({
    location: '',
    startDate: '',
    endDate: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWeatherHistory();
  }, []);

  const loadWeatherHistory = async () => {
    try {
      const records = await getWeatherHistory();
      setWeatherRecords(records);
    } catch (error) {
      console.error('Error loading weather history:', error);
      setError('Failed to load weather history');
    }
  };

  const handleLocationChange = useCallback(async (e) => {
    const location = e.target.value;
    setFormData(prev => ({ ...prev, location }));
    
    if (location.trim().length > 2) {
      setIsLoading(true);
      setError('');
      try {
        const success = await storage.updateByLocation(location);
        if (!success) {
          setError('Could not find weather data for this location');
        }
      } catch (error) {
        console.error('Error fetching weather for location:', error);
        setError('Could not find weather data for this location');
      } finally {
        setIsLoading(false);
      }
    }
  }, [storage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      setError('');
      // Verify location is valid
      const success = await storage.updateByLocation(formData.location);
      if (!success) {
        throw new Error('Invalid location');
      }
      
      const weatherData = {
        location: formData.location,
        dateRange: {
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        },
        currentWeather: storage.data.currentCondition
      };

      if (selectedRecord) {
        await updateWeatherHistory(selectedRecord._id, weatherData);
      } else {
        await createWeatherHistory(weatherData);
      }

      loadWeatherHistory();
      resetForm();
    } catch (error) {
      console.error('Error saving weather history:', error);
      setError('Failed to save weather history. Please check the location and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    try {
      setError('');
      await deleteWeatherHistory(id);
      loadWeatherHistory();
    } catch (error) {
      console.error('Error deleting weather history:', error);
      setError('Failed to delete weather history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    try {
      setError('');
      let exportedData;
      if (exportFormat === 'json') {
        exportedData = JSON.stringify(weatherRecords, null, 2);
      } else if (exportFormat === 'csv') {
        const headers = ['location', 'startDate', 'endDate', 'temperature', 'condition'];
        const rows = weatherRecords.map(record => [
          record.location,
          new Date(record.dateRange.startDate).toLocaleDateString(),
          new Date(record.dateRange.endDate).toLocaleDateString(),
          record.currentWeather?.temperature || 'N/A',
          record.currentWeather?.weather || 'N/A'
        ]);
        exportedData = [headers, ...rows].map(row => row.join(',')).join('\n');
      }

      const blob = new Blob([exportedData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weather-history.${exportFormat}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Failed to export data');
    }
  };

  const resetForm = () => {
    setFormData({
      location: '',
      startDate: '',
      endDate: '',
    });
    setSelectedRecord(null);
    setError('');
  };

  return (
    <div className="weather-history">
      <h2>Weather History</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="weather-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter location"
            value={formData.location}
            onChange={handleLocationChange}
            required
            disabled={isLoading}
          />
          {isLoading && <div className="loading-indicator"></div>}
        </div>
        <div className="date-inputs">
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            required
            disabled={isLoading}
          />
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-buttons">
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Loading...' : selectedRecord ? 'Update' : 'Save'}
          </button>
          {selectedRecord && (
            <button type="button" onClick={resetForm} disabled={isLoading}>Cancel</button>
          )}
        </div>
      </form>

      <div className="export-section">
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          disabled={isLoading}
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
        <button onClick={handleExport} disabled={isLoading}>Export Data</button>
      </div>

      <div className="weather-history-content">
        <div className="records-list">
          {weatherRecords.map((record) => (
            <div key={record._id} className="record-item">
              <h3>{record.location}</h3>
              <p>From: {new Date(record.dateRange.startDate).toLocaleDateString()}</p>
              <p>To: {new Date(record.dateRange.endDate).toLocaleDateString()}</p>
              {record.currentWeather && (
                <div className="weather-info">
                  <p>Last recorded: {record.currentWeather.temperature}°C, {record.currentWeather.weather}</p>
                </div>
              )}
              <div className="record-buttons">
                <button 
                  onClick={async () => {
                    setIsLoading(true);
                    setSelectedRecord(record);
                    setFormData({
                      location: record.location,
                      startDate: new Date(record.dateRange.startDate).toISOString().split('T')[0],
                      endDate: new Date(record.dateRange.endDate).toISOString().split('T')[0]
                    });
                    try {
                      await storage.updateByLocation(record.location);
                    } catch (err) {
                      console.error('Error fetching weather for location:', err);
                      setError('Could not update weather for this location');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                >
                  Edit
                </button>
                <button onClick={() => handleDelete(record._id)} disabled={isLoading}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

WeatherHistory.propTypes = {
  storage: PropTypes.shape({
    updateByLocation: PropTypes.func.isRequired,
    data: PropTypes.shape({
      currentCondition: PropTypes.shape({
        temperature: PropTypes.number,
        weather: PropTypes.string,
        humidity: PropTypes.number,
        windSpeed: PropTypes.number,
        windDirection: PropTypes.string,
        feelsLike: PropTypes.number,
        uvIndex: PropTypes.number
      }).isRequired
    }).isRequired
  }).isRequired
};

export default WeatherHistory; 