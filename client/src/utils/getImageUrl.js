export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path; // Already a full URL
    
    // Get the base API URL (e.g., https://cleanconnect-improved.onrender.com/api)
    let baseUrl = import.meta.env.VITE_API_URL || '';
    
    // Remove the '/api' suffix so we can append '/uploads/...'
    if (baseUrl.endsWith('/api')) {
        baseUrl = baseUrl.slice(0, -4);
    }
    
    // In local development, baseUrl will be empty, and Vite's proxy will handle '/uploads/...' requests.
    // In production, baseUrl will be the Render URL, and the browser will fetch directly from Render.
    return `${baseUrl}${path}`;
};
