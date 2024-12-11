const debugApiCall = async (url, options = {}) => {
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
