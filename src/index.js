import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { MenuProvider } from "./context/MenuContext";
import { LoadingProvider } from "./context/LoadingContext";
import GlobalLoader from "./context/GlobalLoader";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <LoadingProvider>
      <MenuProvider>
        <GlobalLoader />
        <App />
      </MenuProvider>
    </LoadingProvider>
  </BrowserRouter>
);
