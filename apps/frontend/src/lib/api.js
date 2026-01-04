import ky from 'ky';

const api = ky.create({
  prefixUrl: 'http://localhost:1000',
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
