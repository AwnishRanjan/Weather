import ipRegex from 'ip-regex';

class IpFetcher {
  constructor() {
    this.ip = '';
    this.endpoint = 'https://api.ipify.org/?format=json';
    this.fallbackIP = '8.8.8.8'; // Fallback to Google's DNS IP
  }

  async fetch() {
    try {
      const response = await fetch(this.endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      this.ip = result.ip;
      
      if (!this.isValid()) {
        console.warn('Invalid IP received, using fallback IP');
        this.ip = this.fallbackIP;
      }
    } catch (error) {
      console.error('IP fetch error:', error);
      console.warn('Using fallback IP');
      this.ip = this.fallbackIP;
    }
  }

  isValid() {
    return ipRegex().test(this.ip);
  }
}

export default IpFetcher;
