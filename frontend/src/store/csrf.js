import Cookies from "js-cookie";

export async function csrfFetch(url, options = {}) {
  // Set options.url to the development URL when in development
  const baseUrl =
    process.env.NODE_ENV === "production"
      ? "https://hotspot-2-0-vz4v.onrender.com"
      : "http://localhost:5000";

  options.method = options.method || "GET";
  options.headers = options.headers || {};
  options.credentials = "include"; // Important for cookies

  if (options.method.toUpperCase() !== "GET") {
    options.headers["Content-Type"] =
      options.headers["Content-Type"] || "application/json";
    options.headers["XSRF-Token"] = Cookies.get("XSRF-TOKEN");
  }

  // Call fetch with the url and the updated options hash
  const res = await fetch(`${baseUrl}${url}`, options);

  // If the response status code is 400 or above, throw an error
  if (res.status >= 400) throw res;

  // If the response status code is under 400, return the response
  return res;
}

export async function restoreCSRF() {
  try {
    const response = await csrfFetch("/api/csrf/restore");
    if (response.ok) {
      return response;
    }
    throw new Error("Failed to restore CSRF token");
  } catch (error) {
    console.error("Error restoring CSRF:", error);
    throw error;
  }
}
