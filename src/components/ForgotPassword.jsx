import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import mfmslogo from "../assets/mfmslogo.png";

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [usernameValid, setUsernameValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertVariant, setAlertVariant] = useState("danger");

  const navigate = useNavigate();

  //function to handle username

  const handleUsernameSubmit = (e) => {
    e.preventDefault();

    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(username.trim())) {
      // Call the API to check if the email exists

      setUsernameValid(true);
      setShowAlert(false);
    } else {
      setShowAlert(true);
      setAlertMessage("Please enter a valid email address.");
      setAlertVariant("danger");
    }
  };

  // Function to validate the password according to the specified criteria
  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar &&
      isLongEnough
    );
  };

  // Function to handle password reset form submission
  const handlePasswordReset = (e) => {
    e.preventDefault();

    if (!validatePassword(newPassword)) {
      setShowAlert(true);
      setAlertMessage(
        "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters."
      );
      setAlertVariant("danger");

      // Set a timer to refresh the page after 45 seconds (45000 milliseconds)
      const timer = setTimeout(() => {
        window.location.reload();
      }, 20000);

      // Clear the timer if the component is unmounted before the 45 seconds
      return () => clearTimeout(timer);
    } else if (newPassword !== verifyPassword) {
      setShowAlert(true);
      setAlertMessage("Passwords do not match.");
      setAlertVariant("danger");
      // Set a timer to refresh the page after 45 seconds (45000 milliseconds)
      const timer = setTimeout(() => {
        window.location.reload();
      }, 20000);

      // Clear the timer if the component is unmounted before the 45 seconds
      return () => clearTimeout(timer);
    } else {
      // Prepare the request body
      const requestBody = {
        emailOrPhone: username, // or a phone number
        resetPassword: newPassword,
      };

      // Make the API call to reset the password
      fetch("http://192.168.2.7:8080/api/authentication/forgotpassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => {
          if (response.ok) {
            return response.json(); // Parse the response as JSON for a successful request
          } else if (response.status === 404) {
            setShowAlert(true);
            setAlertMessage(
              "User not found. Please check your details and try again."
            );
            setAlertVariant("warning");
            window.alert(
              "Seems to be you do not have an account! please create one."
            );
            navigate("/signup");

            throw new Error("User not found Please create an account!");
          } else if (response.status === 500) {
            setShowAlert(true);
            setAlertMessage("Internal Server Error. Please try again later.");
            setAlertVariant("danger");
            window.alert("Internal Server Error. Please try again later.");
            navigate("/signup");
            throw new Error("Internal Server Error");
          } else {
            return response.json().then((errorData) => {
              throw new Error(errorData.message || "Failed to reset password");
            });
          }
        })
        .then((data) => {
          // Handle successful password reset
          if (data === true) {
            setShowAlert(true);
            setAlertMessage("Password reset successful.");
            setAlertVariant("success");

            // Clear the input fields after successful password reset
            setNewPassword("");
            setVerifyPassword("");
            navigate("/");
          } else {
            // Handle unexpected response
            setShowAlert(true);
            setAlertMessage("Unexpected response from the server.");
            setAlertVariant("danger");
          }
        })
        .catch((error) => {
          // Handle any other errors not specifically caught above
          console.error("Error:", error);
          setShowAlert(true);
          setAlertMessage(error.message);
          setAlertVariant("danger");
        });
    }
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ backgroundColor: "#343a40" }}
    >
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="w-100">
            <Card.Body>
              {/* Logo */}
              <div className="d-flex justify-content-center p-4">
                <img
                  src={mfmslogo}
                  alt="mfms Logo"
                  className="img-fluid rounded"
                  style={{
                    maxHeight: "100px",
                    objectFit: "contain",
                    width: "100%",
                  }}
                />
              </div>
              <h3 className="text-center mb-4">Forgot Password</h3>
              {showAlert && (
                <Alert
                  variant={alertVariant}
                  onClose={() => setShowAlert(false)}
                  dismissible
                >
                  {alertMessage}
                </Alert>
              )}
              {!usernameValid ? (
                <Form onSubmit={handleUsernameSubmit}>
                  <Form.Group className="mb-3" controlId="formUsername">
                    <Form.Label>Enter Your Username</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" className="w-100">
                    Submit
                  </Button>
                </Form>
              ) : (
                <Form onSubmit={handlePasswordReset}>
                  <Form.Group className="mb-3" controlId="formNewPassword">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="formVerifyPassword">
                    <Form.Label>Verify New Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Re-enter new password"
                      value={verifyPassword}
                      onChange={(e) => setVerifyPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button variant="success" type="submit" className="w-100">
                    Reset Password
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
