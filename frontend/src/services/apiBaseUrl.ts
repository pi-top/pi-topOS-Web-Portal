const apiBaseUrl =
  window.location.port === "3000"
    ? "http://" + window.location.hostname + ":80"
    : ""; // use relative urls in prod

export default apiBaseUrl;
