import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { DatabaseContextProvider } from "./context/DatabaseContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <DatabaseContextProvider>
        <App />
      </DatabaseContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
