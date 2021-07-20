const wsBaseUrl =
    "ws://" +
    window.location.host +
    (window.location.origin === "http://localhost:3000"? "" : "80/");

export default wsBaseUrl;
