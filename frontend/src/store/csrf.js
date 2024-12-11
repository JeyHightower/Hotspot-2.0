import Cookies from 'js-cookie';

// export async function csrfFetch(url, options = {}) {
//   console.group('CSRF Fetch Request');
//   console.log(`Requesting: ${url}`);

//   try {
//     const response = await originalCsrfFetch(url, options);
//     const contentType = response.headers.get('content-type');

//     // Clone and check response content
//     const clonedResponse = response.clone();
//     const responseText = await clonedResponse.text();
//     console.log('Response Type:', contentType);
//     console.log('Response Text:', responseText.substring(0, 200));

//     // Only try to parse JSON if content-type is application/json
//     if (contentType && contentType.includes('application/json')) {
//       return response;
//     } else {
//       throw new Error(`Expected JSON response but got ${contentType}`);
//     }
//   } catch (error) {
//     console.error('Request Details:', {
//       url,
//       method: options.method || 'GET',
//       headers: options.headers
//     });
//     throw error;
//   } finally {
//     console.groupEnd();
//   }
// }

export async function csrfFetch(url, options = {}) {
  // set options.method to 'GET' if there is no method
  options.method = options.method || 'GET';
  // set options.headers to an empty object if there is no headers
  options.headers = options.headers || {};

  // if the options.method is not 'GET', then set the "Content-Type" header to
  // "application/json", and set the "XSRF-TOKEN" header to the value of the
  // "XSRF-TOKEN" cookie
  if (options.method.toUpperCase() !== 'GET') {
    options.headers['Content-Type'] =
      options.headers['Content-Type'] || 'application/json';
    options.headers['XSRF-Token'] = Cookies.get('XSRF-TOKEN');
  }
  // call the default window's fetch with the url and the options passed in
  const res = await window.fetch(url, options);

  // if the response status code is 400 or above, then throw an error with the
  // error being the response
  if (res.status >= 400) throw res;

  // if the response status code is under 400, then return the response to the
  // next promise chain
  return res;
}

export function restoreCSRF() {
  return csrfFetch('/api/csrf/restore');
}
