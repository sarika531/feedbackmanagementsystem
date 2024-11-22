import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mfms from "../assets/mfmslogo.png";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap"; // Importing necessary Bootstrap components

/**
 * Login component handles user login functionality with OTP verification.
 * It includes form validation, error handling, OTP generation, and routing based on authentication.
 */
export default function Login() {
  // Declare state variables

  const [loginnedEmployeeDetails, setLoginnedEmployeeDetails] = useState(""); // Stores details of the logged-in employee
  const [otpdetails, setOtpDetails] = useState(""); // Stores OTP details received from the backend
  const [username, setUsername] = useState(""); // Stores the username input from the user
  const [password, setPassword] = useState(""); // Stores the password input from the user
  const [otp, setOtp] = useState(""); // Stores the OTP input from the user
  const [generatedOtp, setGeneratedOtp] = useState(""); // Stores the generated OTP for comparison
  const [isErrorAtForm, setIsErrorAtForm] = useState(false); // Indicates if there are errors in the form
  const [errorsAtForm, setErrorsAtForm] = useState(""); // Stores error messages related to form validation
  const [otpSentMessage, setOtpSentMessage] = useState(""); // Message for OTP sent status
  const [showOtpInput, setShowOtpInput] = useState(false); // State to control OTP input visibility

  const navigate = useNavigate(); // React Router hook to navigate programmatically
  const { login, authUser } = useAuth(); // Get login function and authUser details from Auth context

  /**
   * Handles login button click, performs form validation, and makes an API call to authenticate the user.
   */
  const handleLoginButton = () => {
    let errors = "";

    // Validate username field
    if (!username) {
      errors += "Email is required.\n";
    }

    // Validate password field
    if (!password) {
      errors += "Password is required.\n";
    }

    // Validate OTP field
    if (!otp) {
      errors += "OTP is required.\n";
    }

    // Regular expression patterns for validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|;:,.<>?])[A-Za-z\d!@#$%^&*()_+[\]{}|;:,.<>?]{8,}$/;
    const otpRegex = /^\d{6}$/;

    // Validate email format
    if (!emailRegex.test(username)) {
      errors += "Invalid email format.\n";
    }

    // Validate password strength
    if (!passwordRegex.test(password)) {
      errors +=
        "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.\n";
    }

    // Validate OTP format
    if (!otpRegex.test(otp)) {
      errors += "OTP must be exactly 6 digits and only contain numbers.\n";
    }

    // Validate OTP match
    if (!(otp == otpdetails.otp)) {
      errors += "Please enter a valid OTP.";
    }

    // Display errors if any
    if (errors) {
      setIsErrorAtForm(true);
      setErrorsAtForm(errors);
      return;
    }

    // Prepare request body for login API call
    const requestBody = {
      emailOrPhone: username,
      password: password,
    };

    // Make the API call using fetch
    fetch("http://192.168.2.7:8080/api/authentication/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "Login failed");
          });
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
        // Successful login
        console.log("Login successful:", data);
        setLoginnedEmployeeDetails(data); // Set employee details after login

        // Call login function from context with user details and token
        login(data.userEmailOrPhone, data.id, data.role, data.token);

        // Clear input fields after login
        setUsername("");
        setPassword("");
        setOtp("");
        setIsErrorAtForm(false);
        setErrorsAtForm("");
      })
      .catch((error) => {
        console.error("Error during login:", error);
        setIsErrorAtForm(true); // Show error message on failure
        setErrorsAtForm(error.message || "An error occurred");
      });
  };

  /**
   * Handles the "Generate OTP" button click and sends an OTP to the user's email.
   */
  const handleGenerateOtp = () => {
    const email = username; // Replace with your email input

    // Make the API call to send the OTP
    fetch(`http://192.168.2.7:8080/api/email/generateOTP?email=${username}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          // Handle error responses
          return response.json().then((errorData) => {
            throw new Error(errorData.message || "Failed to send OTP");
          });
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
        // Successful OTP generation
        if (data.emailSent) {
          window.alert("OTP sent successfully"); // Alert the user
          setOtpDetails(data); // Store the received OTP details
          setShowOtpInput(true); // Show OTP input field
        } else {
          console.error("OTP generation failed:", data);
        }
      })
      .catch((error) => {
        // Handle errors here
        console.error("Error during OTP generation:", error);
      });
  };

  /**
   * Navigates to the sign-up page.
   */
  const handlesignupbutton = () => {
    navigate("/signup");
  };

  /**
   * Navigates to the forgot password page.
   */
  const handleforgotpassword = () => {
    navigate("/forgotpassword");
  };

  /**
   * Redirects the user based on their employee type after authentication.
   */
  useEffect(() => {
    if (authUser.employeeType) {
      if (authUser.employeeType === "ROLE_employee") {
        navigate("/loggeduser");
      } else {
        navigate("/aloggeduser");
      }
    }
  }, [authUser, navigate]); // Runs when authUser changes

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={6} lg={5}>
          <div className="card shadow-sm rounded">
            {/* Centered welcome header */}
            <div>
              <h6
                style={{
                  alignItems: "center",
                  textAlign: "center",
                  marginTop: "20px",
                  fontSize: "30px",
                  fontFamily: "Abril Fatface",
                  marginLeft: "25px",
                  fontWeight: "bold",
                }}
              >
                WELCOME
              </h6>
            </div>

            {/* Logo */}
            <div className="d-flex justify-content-center p-4">
              <img
                src={mfms}
                alt="Payswiff Logo"
                className="img-fluid rounded"
                style={{
                  maxHeight: "100px",
                  objectFit: "contain",
                  width: "100%",
                }}
              />
            </div>

            <div className="card-body">
              {/* Email Input */}
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Form.Group>

              {/* Password Input */}
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              {/* Generate OTP Button - only shown when showOtpInput is false */}
              {!showOtpInput && (
                <Button
                  variant="success"
                  className="w-100 mb-3"
                  onClick={handleGenerateOtp}
                >
                  Generate OTP
                </Button>
              )}

              {/* OTP Input Field, shown only when showOtpInput is true */}
              {showOtpInput && (
                <Form.Group className="mb-3">
                  <Form.Label>OTP</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter OTP here"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </Form.Group>
              )}

              {/* Error message with dismissible "X" */}
              {isErrorAtForm && (
                <Alert
                  variant="danger"
                  className="mb-3"
                  onClose={() => setIsErrorAtForm(false)} // Closes the alert when "X" is clicked
                  dismissible
                >
                  {errorsAtForm}
                </Alert>
              )}

              {/* OTP Sent Message */}
              {otpSentMessage && (
                <Alert variant="info" className="mb-3">
                  {otpSentMessage}
                </Alert>
              )}

              {/* Login Button */}
              <Button
                variant="primary"
                className="w-100 mb-3"
                onClick={handleLoginButton}
              >
                Login
              </Button>

              {/* Forgot Password and Sign Up Links */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mt-3">
                <p
                  className="mb-2 mb-sm-0"
                  style={{ color: "#2101f0", cursor: "pointer" }}
                  onClick={handleforgotpassword}
                >
                  Forgot Password?
                </p>
                <div className="d-flex align-items-center">
                  <span className="text-muted">
                    Don&apos;t have an account?
                  </span>
                  <Button
                    className="text-black ms-2"
                    style={{ background: "#ffdc00", outlineColor: "#ffdc00" }}
                    onClick={handlesignupbutton}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
