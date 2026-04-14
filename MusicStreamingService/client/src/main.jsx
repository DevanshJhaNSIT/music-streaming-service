import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="boot-message">
          <h1>Streamify hit a browser error.</h1>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }

    return this.props.children;
  }
}

window.addEventListener("error", (event) => {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = `
    <div class="boot-message">
      <h1>Streamify could not start.</h1>
      <p>${event.message || "Unknown browser error"}</p>
      <button onclick="window.location.reload()">Reload</button>
    </div>
  `;
});

window.addEventListener("unhandledrejection", (event) => {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = `
    <div class="boot-message">
      <h1>Streamify could not finish loading.</h1>
      <p>${event.reason?.message || event.reason || "Unknown browser error"}</p>
      <button onclick="window.location.reload()">Reload</button>
    </div>
  `;
});

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
