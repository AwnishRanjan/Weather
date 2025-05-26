class IpFetcher {
  constructor() {
    this.endpoint = 'https://api.ipify.org?format=json';
    this.ip = null;
  }

  isValid() {
    return this.ip !== null;
  }

  async fetch() {
    try {
      const response = await fetch(this.endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.ip = data.ip;
    } catch (error) {
      // Handle error silently
      this.ip = '8.8.8.8'; // Use Google's DNS as fallback
    }
  }
}

export default IpFetcher;
