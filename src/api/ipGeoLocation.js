class IpGeoLocation {
  constructor(secret) {
    this.endpoint = ip => `https://weather-api-iondrimba.vercel.app/api?ip=${ip}`;
    this.data = null;
    this.secret = secret;
  }

  async fetch(ip) {
    try {
      if (!ip) {
        throw new Error('No IP address provided');
      }

      const response = await fetch(this.endpoint(ip), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result || !result.location) {
        throw new Error('Invalid response format from weather API');
      }

      this.data = result;
    } catch (error) {
      console.error('Geolocation fetch error:', error);
      // Initialize with default data instead of throwing
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
}

export default IpGeoLocation;
