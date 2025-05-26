import IpGeoLocation from '../api/ipGeoLocation';
import IpFetcher from '../api/ipfetcher';
import timeConvert, { addLeadingZero } from '../helpers/time';
import icons from '../helpers/icons';
import weekdays from '../helpers/weekdays';
import initialState from '../initialState';

export default class Storage {
  constructor() {
    this.ipFetcher = new IpFetcher();
    this.ipGeoLocation = new IpGeoLocation();
    this.data = { ...initialState };
    this.currentDate = new Date();
    this.updateCallbacks = [];
  }

  // Add callback for UI updates
  addUpdateCallback(callback) {
    this.updateCallbacks.push(callback);
  }

  // Notify all subscribers of data updates
  notifyUpdate() {
    this.updateCallbacks.forEach(callback => callback(this.data));
  }

  update(weatherData = null) {
    try {
      const data = weatherData || this.ipGeoLocation.data;
      if (!data) {
        return;
      }

      const currentHour = new Date().getHours();
      const nextHours = data.forecast.forecastday[0].hour
        .filter(item => {
          const itemHour = new Date(item.time_epoch * 1000).getHours();
          return itemHour > currentHour;
        });

      this.data = {
        latitude: data.location.lat,
        longitude: data.location.lon,
        lastUpdate: this.getLastUpdate(this.currentDate),
        currentCondition: {
          location: data.location.name,
          date: timeConvert(data.location.localtime_epoch).localeDateString,
          temperature: Math.round(data.current.temp_c),
          weather: data.current.condition.text,
          humidity: data.current.humidity,
          windSpeed: Math.round(data.current.wind_kph),
          windDirection: data.current.wind_dir,
          feelsLike: Math.round(data.current.feelslike_c),
          uvIndex: data.current.uv,
        },
        foreCastHourly: nextHours.slice(0, 6).map((item) => ({
          time: timeConvert(item.time_epoch).hours,
          rainProbability: item.chance_of_rain,
          temperature: Math.floor(item.temp_c),
          icon: item.is_day
            ? `svg/day/${icons(item.condition.code)}.png`
            : `svg/night/${icons(item.condition.code)}.png`,
          condition: item.condition.text
        })),
        foreCastDaily: data.forecast.forecastday.slice(1, 6).map(item => ({
          weekDay: weekdays(timeConvert(item.date_epoch).weekDay),
          rainProbability: item.day.daily_chance_of_rain,
          icon: `svg/day/${icons(item.day.condition.code)}.png`,
          temperature: {
            max: Math.round(item.day.maxtemp_c),
            min: Math.round(item.day.mintemp_c)
          },
          condition: item.day.condition.text
        }))
      };

      this.notifyUpdate();
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Error updating weather data:', error);
    }
  }

  getLastUpdate(currentDate) {
    return `${addLeadingZero(currentDate.getHours())}:${addLeadingZero(currentDate.getMinutes())}`;
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('weatherData', JSON.stringify(this.data));
      localStorage.setItem('lastupdate', this.currentDate.toString());
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  loadFromLocalStorage() {
    try {
      const savedData = localStorage.getItem('weatherData');
      if (savedData) {
        this.data = JSON.parse(savedData);
        this.notifyUpdate();
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }

  async updateByLocation(location) {
    try {
      const weatherData = await this.ipGeoLocation.fetchByLocation(location);
      this.update(weatherData);
      return true;
    } catch (error) {
      console.error('Error updating weather by location:', error);
      return false;
    }
  }

  async _updateIP() {
    try {
      if (localStorage.getItem('ip')) {
        this.ipFetcher.ip = localStorage.getItem('ip');
      } else {
        await this.ipFetcher.fetch();
        if (this.ipFetcher.isValid()) {
          localStorage.setItem('ip', this.ipFetcher.ip);
        }
      }
    } catch (error) {
      console.error('Error updating IP:', error);
    }
  }

  async _updateGeoLocation() {
    try {
      const savedData = localStorage.getItem('weatherData');
      const lastUpdate = localStorage.getItem('lastupdate');
      
      if (savedData && lastUpdate) {
        const lastUpdateTime = new Date(lastUpdate);
        const timeDiff = new Date() - lastUpdateTime;
        
        // Update if data is older than 30 minutes
        if (timeDiff < 30 * 60 * 1000) {
          this.data = JSON.parse(savedData);
          this.notifyUpdate();
          return;
        }
      }

      await this.ipGeoLocation.fetch(this.ipFetcher.ip);
      this.update();
    } catch (error) {
      console.error('Error updating geolocation:', error);
    }
  }

  async fetch() {
    await this._updateIP();
    await this._updateGeoLocation();
  }

  async getLocation() {
    this.currentDate = new Date();
    await this.fetch();
  }
}
