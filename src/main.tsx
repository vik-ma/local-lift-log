import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { DatabaseContextProvider } from "./context/DatabaseContextProvider.tsx";
import { Provider } from "react-redux";
import { store } from "./state/store.ts";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <DatabaseContextProvider>
          <App />
        </DatabaseContextProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
