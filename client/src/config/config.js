const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.DEV) return '/api';
  return 'https://cleanconnect-new-1cleanconnect-backend.onrender.com/api';
};

const getDustbinUrl = () => {
  if (import.meta.env.VITE_DUSTBIN_API_URL) return import.meta.env.VITE_DUSTBIN_API_URL;
  if (import.meta.env.DEV) return '/bins';
  return 'https://cleanconnect-new-1cleanconnect-backend.onrender.com/api/bins';
}

const config = {
  apiUrl: getBaseUrl(),
  dustbinApiUrl: getDustbinUrl(),
};

export default config;
