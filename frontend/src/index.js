import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import Root from "./Root";

if (process.env.NODE_ENV === "development") {
  const { rest } = require("msw");
  const { worker } = require("./msw/worker");

  // add rest helpers and worker to window to add handlers at runtime
  window.rest = rest;
  window.msw = worker;

  // begin intercepting requests
  worker.start().then(() => console.log("msw worker started", worker));
}

ReactDOM.render(<Root />, document.getElementById("root"));
