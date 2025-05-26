const { Parser } = require('json2csv');

const STORAGE_KEY = 'weatherHistory';

// Helper function to generate a unique ID
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// Helper function to get stored data
const getStoredData = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

// Helper function to save data
const saveData = data => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// Create new weather history entry
export const createWeatherHistory = async data => {
  try {
    const weatherHistory = getStoredData();
    const newEntry = {
      _id: generateId(),
      ...data,
      createdAt: new Date().toISOString()
    };
    weatherHistory.push(newEntry);
    saveData(weatherHistory);
    return newEntry;
  } catch (error) {
    throw new Error(`Failed to create weather history: ${error.message}`);
  }
};

// Read weather history entries
export const getWeatherHistory = async () => {
  try {
    const weatherHistory = getStoredData();
    return weatherHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    throw new Error(`Failed to fetch weather history: ${error.message}`);
  }
};

// Update weather history entry
export const updateWeatherHistory = async (id, data) => {
  try {
    const weatherHistory = getStoredData();
    const index = weatherHistory.findIndex(item => item._id === id);
    if (index === -1) {
      throw new Error('Weather history entry not found');
    }
    const updatedEntry = {
      ...weatherHistory[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    weatherHistory[index] = updatedEntry;
    saveData(weatherHistory);
    return updatedEntry;
  } catch (error) {
    throw new Error(`Failed to update weather history: ${error.message}`);
  }
};

// Delete weather history entry
export const deleteWeatherHistory = async id => {
  try {
    const weatherHistory = getStoredData();
    const filteredHistory = weatherHistory.filter(item => item._id !== id);
    saveData(filteredHistory);
    return true;
  } catch (error) {
    throw new Error(`Failed to delete weather history: ${error.message}`);
  }
};

// Export data in various formats
export const exportData = async (format, data) => {
  try {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(data, null, 2);

      case 'csv':
        const parser = new Parser();
        return parser.parse(data);

      default:
        throw new Error('Unsupported export format');
    }
  } catch (error) {
    throw new Error(`Failed to export data: ${error.message}`);
  }
}; 