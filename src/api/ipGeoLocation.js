class IpGeoLocation {
  constructor(secret) {
    this.apiKey = 'd5f0e5d4a6c94c0b9c4235007232411';
    this.data = null;
    this.secret = secret;
  }

  getEndpoint(query) {
    return `https://api.weatherapi.com/v1/forecast.json?key=${this.apiKey}&q=${encodeURIComponent(query)}&days=6&aqi=no`;
  }

  async fetchByLocation(location) {
    try {
      const response = await fetch(this.getEndpoint(location));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
      return this.data;
    } catch (error) {
      // Throw error with more context
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  async fetch(ip) {
    try {
      const response = await fetch(this.getEndpoint(ip));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.data = await response.json();
    } catch (error) {
      // Set default data and throw error with context
      this.setDefaultData();
      throw new Error(`Failed to fetch weather data: ${error.message}`);
    }
  }

  setDefaultData() {
    this.data = {
      location: {
        name: 'New York',
        lat: 40.7128,
        lon: -74.0060,
        localtime_epoch: Date.now() / 1000
      },
      current: {
        temp_c: 20,
        condition: { text: 'Partly cloudy', code: 1003 }
      },
      forecast: {
        forecastday: [{
          hour: Array(24).fill().map((_, i) => ({
            time_epoch: (Date.now() / 1000) + (i * 3600),
            temp_c: 20,
            chance_of_rain: 0,
            condition: { code: 1003 },
            is_day: i >= 6 && i <= 18
          }))
        }].concat(Array(5).fill().map((_, i) => ({
          date_epoch: (Date.now() / 1000) + ((i + 1) * 86400),
          day: {
            maxtemp_c: 25,
            mintemp_c: 15,
            daily_chance_of_rain: 0,
            condition: { code: 1003 },
            is_day: 1
          }
        })))
      }
    };
  }
}

export default IpGeoLocation;
