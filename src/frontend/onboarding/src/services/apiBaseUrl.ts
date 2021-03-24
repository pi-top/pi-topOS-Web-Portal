const apiBaseUrl =
  window.location.origin === "http://localhost:3000"
    ? "http://localhost:80"
    : ""; // use relative urls in prod

export default apiBaseUrl;
