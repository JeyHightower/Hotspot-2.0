import Cookies from 'js-cookie';

export async function csrfFetch(url, options = {}) {
  // Set default options
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.credentials = 'include';

  // Set headers for non-GET requests
  if (options.method.toUpperCase() !== 'GET') {
    options.headers['Content-Type'] = options.headers['Content-Type'] || 'application/json';
    options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
  }

  const res = await fetch(url, options);
  
  // Return the response for 401 status instead of throwing
  if (res.status >= 400 && res.status !== 401) throw res;
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
