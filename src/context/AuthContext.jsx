
import { createContext, useContext, useState, useEffect } from "react";

// Create the AuthContext
const AuthContext = createContext();

// Create a provider component
// eslint-disable-next-line react/prop-types
export function AuthProvider({ children }) {
  // State to hold logged-in user data, including username, employeeId, and employeeType
  const [authUser, setAuthUser] = useState({
    username: null,
    employeeId: null,
    employeeType: null,
    loginnedEmployeeDetails:null
  });

  // Use effect to check for existing user in localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setAuthUser(JSON.parse(storedUser));
    }
  }, []);

  // Modify the login function to include token in loginnedEmployeeDetails
  const login = (username, employeeId, employeeType, token) => {
    const user = {
      username,
      employeeId,
      employeeType,
      token, // Store token here
    };
    setAuthUser(user);
    localStorage.setItem("authUser", JSON.stringify(user)); // Store in localStorage
  };

  // Function to log out the user
  const logout = () => {
    setAuthUser({
      username: null,
      employeeId: null,
      employeeType: null,
      loginnedEmployeeDetails:null
    });
    localStorage.removeItem("authUser");
     // Remove from localStorage
  };

  return (
    <AuthContext.Provider value={{ authUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the AuthContext easily throughout the app
export function useAuth() {
  return useContext(AuthContext);
}
