import ky from 'ky';

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL || 'http://localhost:1000',
  credentials: 'include',
  hooks: {
    beforeRequest: [
      (request) => {
        // Add credentials if needed
      }
    ]
  }
});

export default api;
