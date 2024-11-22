import { Routes, Route } from "react-router-dom"; // Import necessary components for routing
import SignupFormDetails from "./components/SignupFormDetails"; // Import the SignupFormDetails component
import Login from "./components/Login"; // Import the Login component
import LoggedinUser from "./components/LoggedinUser"; // Import the LoggedinUser component
import EmployeeHome from "./components/EmployeeHome"; // Import the EmployeeHome component
import AllFeedBacks from "./components/AllFeedBacks"; // Import the AllFeedBacks component
import EmployeeProfile from "./components/EmployeeProfile"; // Import the EmployeeProfile component
import EmployeeVisitedMerchants from "./components/EmployeeVisitedMerchants"; // Import the EmployeeVisitedMerchants component
import EmployeeCreateFeedBack from "./components/EmployeeCreateFeedBack"; // Import the EmployeeCreateFeedBack component
import AdminLoggedInUser from "./components/admincomponents/AdminLoggedInUser"; // Import AdminLoggedInUser component
import AdminHome from "./components/admincomponents/AdminHome"; // Import AdminHome component
import AdminViewAllEmployees from "./components/admincomponents/AdminViewAllEmployees"; // Import AdminViewAllEmployees component
import AdminViewAllFeedbacks from "./components/admincomponents/AdminViewAllFeedbacks"; // Import AdminViewAllFeedbacks component
import AdminViewAllMerchants from "./components/admincomponents/AdminViewAllMerchants"; // Import AdminViewAllMerchants component
import AdminViewAllDevices from "./components/admincomponents/AdminViewAllDevices"; // Import AdminViewAllDevices component
import AdminProfile from "./components/admincomponents/AdminProfile"; // Import AdminProfile component
import ForgotPassword from "./components/ForgotPassword"; // Import ForgotPassword component
import AdminCreateResource from "./components/admincomponents/AdminCreateResource"; // Import AdminCreateResource component

function App() {
  return (
    <Routes> {/* Define routes for the application */}
      <Route path="/" element={<Login />} /> {/* Set the default route to Login */}
      <Route path="/signup" element={<SignupFormDetails />} /> {/* Route for the signup page */}
      <Route path="/forgotpassword" element={<ForgotPassword />} /> {/* Route for the forgot password page */}
      
      {/* Nested routes under the logged-in user */}
      <Route path="/loggeduser" element={<LoggedinUser />}> {/* Parent route for logged-in user */}
        <Route index element={<EmployeeHome />} /> {/* Default child route for employee home */}
        <Route path="home" element={<EmployeeHome />} /> {/* Route for employee home */}
        <Route path="createfeedback" element={<EmployeeCreateFeedBack />} /> {/* Route for creating feedback */}
        <Route path="feedbacks" element={<AllFeedBacks />} /> {/* Route to view all feedbacks */}
        <Route path="employeeprofile" element={<EmployeeProfile />} /> {/* Route for employee profile */}
        <Route path="merchantsvisited" element={<EmployeeVisitedMerchants />} /> {/* Route for merchants visited */}
      </Route>

      {/* Nested routes under the admin logged-in user */}
      <Route path="/aloggeduser" element={<AdminLoggedInUser />}> {/* Parent route for admin user */}
        <Route index element={<AdminHome />} /> {/* Default child route for admin home */}
        <Route path="home" element={<AdminHome />} /> {/* Route for admin home */}
        <Route path="viewallemployees" element={<AdminViewAllEmployees />} /> {/* Route to view all employees */}
        <Route path="viewallfeedbacks" element={<AdminViewAllFeedbacks />} /> {/* Route to view all feedbacks */}
        <Route path="viewallmerchants" element={<AdminViewAllMerchants />} /> {/* Route to view all merchants */}
        <Route path="viewalldevices" element={<AdminViewAllDevices />} /> {/* Route to view all devices */}
        <Route path="adminprofile" element={<AdminProfile />} /> {/* Route for admin profile */}
        <Route path="createresource" element={<AdminCreateResource />} /> {/* Route for creating resources */}
      </Route>
    </Routes>
  );
}

export default App; // Export the App component
