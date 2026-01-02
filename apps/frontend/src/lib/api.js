import ky from 'ky';

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  hooks: {
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response && response.body) {
          try {
            const data = await response.json();
            error.message = data.message || error.message;
          } catch (e) {
            // fallback
          }
        }
        return error;
      }
    ]
  }
});
