import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import App from "./App";
import "./index.css";

import { attachInterceptors } from "./interceptors/attachInterceptors";
import { setGlobalUserHandler } from "./stores/globalUserStore";

attachInterceptors(setGlobalUserHandler); 

/**
 * Entry point for the React application that initializes and renders the app.
 * 
 * This file is responsible for rendering the root component of the React app, setting up the routing, and providing
 * global context for notifications. It also attaches HTTP request interceptors and manages the user state globally.
 * 
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <App />
      </SnackbarProvider>
    </BrowserRouter>
  </React.StrictMode>
);
