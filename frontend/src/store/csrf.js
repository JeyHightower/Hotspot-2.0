import Cookies from 'js-cookie';

export async function csrfFetch(url, options = {}) {
  // Set options.method to 'GET' if there isn't a method
  options.method = options.method || 'GET';
  // Set options.headers to an empty object if there isn't headers
  options.headers = options.headers || {};

  // If the options.method is not 'GET', then set the "Content-Type" header to
  // "application/json" and the "XSRF-TOKEN" header to the value of the
  // "XSRF-TOKEN" cookie
  if (options.method.toUpperCase() !== 'GET') {
    options.headers['Content-Type'] =
      options.headers['Content-Type'] || 'application/json';
    options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
  }

  // Call fetch with the url and the updated options hash
  const res = await fetch(url, options);

  // If the response status code is 400 or above, throw an error
  if (res.status >= 400) throw res;

  // If the response status code is under 400, return the response
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
