/*
 Ensure the frontend uses relative endpoints in development by default so
 that the msw worker can intercept those requests. To bypass the worker and use
 a development version of the backend set REACT_APP_API_PORT to match the port
 it is running on.
*/

const apiBaseUrl = process.env.REACT_APP_API_PORT
  ? "http://" + window.location.hostname + ":" + process.env.REACT_APP_API_PORT
  : ""; // use relative urls in prod

export default apiBaseUrl;
