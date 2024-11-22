// Import necessary modules and components
import { StrictMode } from "react"; // Import StrictMode for highlighting potential problems in an application
import { createRoot } from "react-dom/client"; // Import createRoot for rendering the application
import App from "./App.jsx"; // Import the main App component
import "./index.css"; // Import global CSS styles
import { BrowserRouter } from "react-router-dom"; // Import BrowserRouter for routing
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS for styling
import { AuthProvider } from "./context/AuthContext"; // Import the AuthProvider for authentication context

// Render the application
createRoot(document.getElementById("root")).render(
  <BrowserRouter> {/* Wrap the application with BrowserRouter for routing */}
    <StrictMode> {/* Enable StrictMode to highlight potential issues */}
      <AuthProvider> {/* Wrap App with AuthProvider to provide authentication context to all components */}
        <App /> {/* Render the main App component */}
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
);
