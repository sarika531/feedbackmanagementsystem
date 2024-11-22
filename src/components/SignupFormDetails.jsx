import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Card,
} from "react-bootstrap";
import mfmslogo from "../assets/mfmslogo.png";
export default function SignupFormDetails() {
  const [step, setStep] = useState(1);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePhoneNumber, setEmployeePhoneNumber] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");
  const [employeePayswiffId, setEmployeePayswiffId] = useState("");
  const [employeeDesignation, setEmployeeDesignation] = useState("");
  const [employeeType, setEmployeeType] = useState("admin");
  const [isErrorAtForm, setIsErrorAtForm] = useState(false);
  const [errorsAtForm, setErrorsAtForm] = useState("");
  const navigate = useNavigate();

  const handleNext = async () => {
    if (step === 1) {
      if (!employeeName || !employeeEmail || !employeePhoneNumber) {
        setIsErrorAtForm(true);
        setErrorsAtForm("Please fill in all fields.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(employeeEmail)) {
        setIsErrorAtForm(true);
        setErrorsAtForm("Invalid email format.");
        return;
      }

      const phoneRegex = /^\d{10}$/; // 10-digit phone number
      if (!phoneRegex.test(employeePhoneNumber)) {
        setIsErrorAtForm(true);
        setErrorsAtForm("Phone number must be 10 digits long.");
        return;
      }

      setStep(2);
    } else {
      if (!employeePassword || !employeePayswiffId || !employeeDesignation) {
        setIsErrorAtForm(true);
        setErrorsAtForm("Please fill in all fields.");
        return;
      }

      const payswiffIdRegex = /^\d{5}$/; // 5-digit Payswiff ID
      if (!payswiffIdRegex.test(employeePayswiffId)) {
        setIsErrorAtForm(true);
        setErrorsAtForm(
          "Payswiff ID must be 5 digits long and contain only numbers."
        );
        return;
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      if (!passwordRegex.test(employeePassword)) {
        setIsErrorAtForm(true);
        setErrorsAtForm(
          "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special symbol."
        );
        return;
      }

      // Check if user already exists
      const existsResponse = await fetch(
        `http://192.168.2.7:8080/api/employees/get?email=${employeeEmail}&payswiffId=${employeePayswiffId}&phoneNumber=${employeePhoneNumber}`
      );

      if (existsResponse.status === 200) {
        setIsErrorAtForm(true);
        setErrorsAtForm(
          "An account with this email, phone number, or Payswiff ID already exists."
        );
        return;
      }

      handleAccountCreationButton();
    }
  };

  const handleAccountCreationButton = async () => {
    const employeeData = {
      employeeName,
      employeeEmail,
      employeePhoneNumber,
      employeePassword,
      employeePayswiffId,
      employeeDesignation,
      employeeType,
    };

    try {
      const response = await fetch(
        "http://192.168.2.7:8080/api/employees/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(employeeData),
        }
      );

      if (response.status === 201) {
        alert("Account created successfully! Please log in.");
        navigate("/"); // Redirect to login page
      } else if (response.status === 500) {
        alert("Internal server error. Please try again later.");
      } else {
        const errorData = await response.json();
        if (errorData.message) {
          setIsErrorAtForm(true);
          setErrorsAtForm(errorData.message);
        }
      }
    } catch (error) {
      console.error("Error creating account:", error);
      setIsErrorAtForm(true);
      setErrorsAtForm("An error occurred while creating the account.");
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center vh-100 ">
      <Row className="w-100 justify-content-center">
        {/* Signup Form */}
        <Col xs={12} md={6} lg={4}>
          <Card className="shadow-sm w-100">
            <Card.Body>
              <div className="text-center mb-4">
                <img
                  src={mfmslogo} // Replace with your image URL
                  alt="Descriptive alt text" // Provide a description for accessibility
                  className="img-fluid mb-3" // Use Bootstrap class for responsiveness
                  style={{ width: "100px", borderRadius: "10px" }}
                />
                <h2 className="text-primary">Create Your Account</h2>
                <p className="text-muted">
                  Please enter your details to create an account
                </p>
              </div>

              {/* Form Fields */}
              <Form>
                {/* Step 1 Fields */}
                {step === 1 && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your name"
                        value={employeeName}
                        onChange={(e) => setEmployeeName(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={employeeEmail}
                        onChange={(e) => setEmployeeEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your phone number"
                        value={employeePhoneNumber}
                        onChange={(e) => setEmployeePhoneNumber(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </>
                )}

                {/* Step 2 Fields */}
                {step === 2 && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter your password"
                        value={employeePassword}
                        onChange={(e) => setEmployeePassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Payswiff ID</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your Payswiff ID"
                        value={employeePayswiffId}
                        onChange={(e) => setEmployeePayswiffId(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Designation</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your designation"
                        value={employeeDesignation}
                        onChange={(e) => setEmployeeDesignation(e.target.value)}
                        required
                      />
                    </Form.Group>
                  </>
                )}

                {/* Display error messages if there are any */}
                {isErrorAtForm && (
                  <Alert
                    variant="danger"
                    className="mb-3"
                    dismissible
                    onClose={() => setIsErrorAtForm(false)}
                  >
                    {errorsAtForm}
                  </Alert>
                )}

                {/* Next Button */}
                <Button
                  variant="primary"
                  className="w-100 mb-3"
                  onClick={handleNext}
                >
                  {step === 1 ? "Next" : "Create Account"}
                </Button>
              </Form>

              {/* Redirect to login page */}
              <div className="d-flex justify-content-center mt-3">
                <Button
                  variant="link"
                  className="text-muted"
                  onClick={() => navigate("/")}
                >
                  Back to Login
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
