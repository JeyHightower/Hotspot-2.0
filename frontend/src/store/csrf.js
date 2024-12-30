import Cookies from 'js-cookie';

export async function csrfFetch(url, options = {}) {
  // Set options.url to the development URL when in development
  const baseUrl = process.env.NODE_ENV === 'production'
    ? 'https://hotspot-2-0-vz4v.onrender.com'
    : 'http://localhost:5000';

  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.credentials = 'include';

  // Add Authorization header if there's a token in localStorage
  const token = localStorage.getItem('token');
  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (options.method.toUpperCase() !== 'GET') {
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
  }

  const res = await fetch(`${baseUrl}${url}`, options);

  if (res.status >= 400) throw res;
  return res;
}
// Add proper error handling for CSRF restore
export async function restoreCSRF() {
  try {
    const response = await csrfFetch('/api/csrf/restore');
    if (response.ok) {
      return response;
    }
    throw new Error('Failed to restore CSRF token');
  } catch (error) {
    console.error('Error restoring CSRF:', error);
    throw error;
  }
}
