export const debugApiCall = async (url, options = {}) => {
  const response = await fetch(url, options);
  const contentType = response.headers.get('content-type');
  
  console.log({
    url,
    method: options.method || 'GET',
    contentType,
    status: response.status,
    statusText: response.statusText
  });
  
  return response;
};

export const fetchWithTracking = async (url) => {
  console.group('API Request');
  console.time('Request Duration');
  
  try {
    const response = await debugApiCall(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Request Failed:', {
      url,
      error: error.message
    });
    throw error;
  } finally {
    console.timeEnd('Request Duration');
    console.groupEnd();
  }
};
