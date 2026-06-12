import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import {
  RouterProvider,
} from "@tanstack/react-router";
import { Router } from "./router";
import "./dev-smoke";

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={Router} />
    </StrictMode>
  );
}
