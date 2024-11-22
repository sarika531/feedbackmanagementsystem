import React, { useEffect, useState } from "react"; // Import necessary libraries
import { Table, Row, Col, Card, Button } from "react-bootstrap"; // Import Bootstrap components
import ErrorModal from "../../components/ErrorModal"; // Import ErrorModal component
import StarRating from "../admincomponents/StarRating"; // Import StarRating component
import mfmslogo from "../../assets/mfmslogo.png";
import * as XLSX from "xlsx"; // Import the xlsx library

// Main functional component
export default function FeedbackTableForAdmin() {
  const [feedbacks, setFeedbacks] = useState([]); // State to hold feedback data
  const [expandedFeedbackId, setExpandedFeedbackId] = useState(null); // State to track which feedback is expanded
  const [questions, setQuestions] = useState([]); // State to hold questions associated with feedback
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // State for current question index
  const [error, setError] = useState(null); // State for error handling
  const [showErrorModal, setShowErrorModal] = useState(false); // State to control visibility of error modal
  const [loadingQuestions, setLoadingQuestions] = useState(false); // State for loading questions

  // Retrieve and parse the stored user data
  const storedUser = localStorage.getItem("authUser");
  const authUser = storedUser ? JSON.parse(storedUser) : null; // Parse user data from local storage
  const token = authUser?.token; // Get the token from user data

  // Function to fetch feedback data from the API
  const fetchFeedbacks = async () => {
    try {
      if (!token) {
        throw new Error("Authorization token is missing"); // Throw error if token is missing
      }

      const response = await fetch(
        "http://192.168.2.7:8080/api/feedback/getallfeedbacks",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include authorization header
          },
        }
      );

      if (!response.ok) {
        handleResponseError(response); // Handle errors based on response status
        return;
      }

      const data = await response.json(); // Parse the response data
      setFeedbacks(data); // Update state with fetched data
    } catch (error) {
      console.error("Error fetching feedback data:", error);
      setError(error.message); // Update error state
      setShowErrorModal(true); // Show error modal
    }
  };

  // Function to fetch questions for a specific feedback
  const fetchFeedbackQuestions = async (feedbackId) => {
    setLoadingQuestions(true); // Start loading
    setCurrentQuestionIndex(0); // Reset current question index
    setQuestions([]); // Reset questions state

    try {
      const response = await fetch(
        `http://192.168.2.7:8080/api/FeedbackQuestions/feedback/questions/${feedbackId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Include authorization header
          },
        }
      );

      if (!response.ok) {
        handleResponseError(response); // Handle errors based on response status
        return;
      }

      const data = await response.json(); // Parse the response data
      setQuestions(data); // Update state with questions
    } catch (error) {
      console.error("Error fetching feedback questions:", error);
      setError(error.message); // Update error state
      setShowErrorModal(true); // Show error modal
    } finally {
      setLoadingQuestions(false); // Stop loading
    }
  };

  // Function to handle response errors based on status codes
  const handleResponseError = (response) => {
    let errorMessage = "An error occurred"; // Default error message
    if (response.status === 401) {
      errorMessage = "Unauthorized access. Please log in.";
    } else if (response.status === 403) {
      errorMessage = "Access forbidden. You do not have permission.";
    } else if (response.status === 404) {
      errorMessage = "Feedback not found.";
    } else if (response.status === 500) {
      errorMessage = "Internal server error. Please try again later.";
    }
    throw new Error(errorMessage); // Throw error with the appropriate message
  };

  useEffect(() => {
    fetchFeedbacks(); // Fetch feedbacks on component mount
  }, [token]);

  // Function to toggle the expanded state of a feedback row
  const toggleExpandRow = (feedbackId) => {
    if (feedbackId === expandedFeedbackId) {
      setExpandedFeedbackId(null); // Collapse if already expanded
      setQuestions([]); // Reset questions when collapsing
      return;
    }
    setExpandedFeedbackId(feedbackId); // Expand the selected row
    fetchFeedbackQuestions(feedbackId); // Fetch questions for the selected feedback
  };

  // Function to close the error modal
  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError(null); // Reset error state
  };

  // Functions to handle question navigation
  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Move to next question
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1); // Move to previous question
    }
  };
  const exportFeedbackToExcel = () => {
    const data = feedbacks.map((feedback) => {
      // Construct feedback data with employee, merchant, and device details
      const feedbackData = {
        "Feedback ID": feedback.feedbackId,
        EmployeeId: feedback.feedbackEmployee.employeeId,
        "Employee Name": feedback.feedbackEmployee.employeeName,
        "Merchant Name": feedback.feedbackMerchant.merchantName,
        "Merchant Business Name":
          feedback.feedbackMerchant.merchantBusinessName,
        "Merchant Business Type":
          feedback.feedbackMerchant.merchantBusinessType,
        "Device Model": feedback.feedbackDevice.deviceModel,
        Rating: feedback.feedbackRating,
        Comments: feedback.feedback,
        "Creation Time": feedback.feedbackCreationTime
          ? new Date(feedback.feedbackCreationTime).toLocaleString()
          : "N/A",
        "Update Time": feedback.feedbackUpdationTime
          ? new Date(feedback.feedbackUpdationTime).toLocaleString()
          : "N/A",
      };

      // Get related questions for the current feedback
      const relatedQuestions = questions.filter(
        (question) => question.feedbackId === feedback.feedbackId
      );

      // Append related questions directly to the feedback data
      relatedQuestions.forEach((question, index) => {
        // Check if question is defined and has the required properties
        if (
          question &&
          question.questionDescription !== undefined &&
          question.answer !== undefined
        ) {
          feedbackData[`Question ${index + 1}`] =
            question.questionDescription + ": " + question.answer;
        } else {
          console.warn(
            `Question ${index + 1} is undefined or missing properties`,
            question
          );
        }
      });

      return feedbackData;
    });

    // Generate worksheet and workbook for Excel export
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback");

    // Trigger download
    XLSX.writeFile(workbook, "Feedback_Details.xlsx");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-white">Feedbacks</h2>
      <Table striped bordered hover variant="dark" className="rounded">
        <thead>
          <tr>
            <th>Feedback ID</th>
            <th>Employee Name</th>
            <th>Merchant Name</th> {/* Correctly label as Merchant Name */}
            <th>Device Model</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((feedback) => (
            <React.Fragment key={feedback.feedbackId}>
              <tr
                onClick={() => toggleExpandRow(feedback.feedbackId)} // Toggle expand on row click
                style={{ cursor: "pointer", backgroundColor: "#212529" }} // Pointer cursor and background color
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#3a3f44"; // Change background on hover
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#212529"; // Revert background on mouse leave
                }}
              >
                <td>{feedback.feedbackId}</td>
                <td>{feedback.feedbackEmployee.employeeName}</td>
                <td>{feedback.feedbackMerchant.merchantName}</td>{" "}
                <td>{feedback.feedbackDevice.deviceModel}</td>
                <td>
                  <StarRating
                    rating={feedback.feedbackRating}
                    color1="yellow"
                    color2="white"
                  />{" "}
                </td>
              </tr>
              {expandedFeedbackId === feedback.feedbackId && ( // Check if this row is expanded
                <tr>
                  <td colSpan="5">
                    <div
                      className="p-3"
                      style={{
                        background:
                          "linear-gradient(to right,#D8B5FF ,#1EAE98)",
                        borderRadius: "5px",
                      }}
                    >
                      <Row>
                        {/* Employee Details */}
                        <Col md={6} xs={12}>
                          <Card
                            className="mb-3"
                            style={{
                              background:
                                "linear-gradient(to right,#BFF098 ,#6FD6FF)", // Gradient colors
                              border: "none",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <Card.Body>
                              <Card.Title className="text-center">
                                Employee Details
                              </Card.Title>
                              <p>
                                <strong>Employee ID:</strong>{" "}
                                {feedback.feedbackEmployee.employeeId}
                              </p>
                              <p>
                                <strong>Employee Email:</strong>{" "}
                                {feedback.feedbackEmployee.employeeEmail}
                              </p>
                              <p>
                                <strong>Employee Phone:</strong>{" "}
                                {feedback.feedbackEmployee.employeePhoneNumber}
                              </p>
                              <p>
                                <strong>Employee Designation:</strong>{" "}
                                {feedback.feedbackEmployee.employeeDesignation}
                              </p>{" "}
                            </Card.Body>
                          </Card>
                        </Col>
                        {/* Merchant Details */}
                        <Col md={6} xs={12}>
                          <Card
                            className="mb-3"
                            style={{
                              background:
                                "linear-gradient(to right,#BFF098 ,#6FD6FF)", // Gradient colors
                              border: "none",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <Card.Body>
                              <Card.Title className="text-center">
                                Merchant Details
                              </Card.Title>
                              <p>
                                <strong>Merchant Name:</strong>{" "}
                                {feedback.feedbackMerchant.merchantBusinessName}
                              </p>{" "}
                              <p>
                                <strong>Merchant Business Type:</strong>{" "}
                                {feedback.feedbackMerchant.merchantBusinessType}
                              </p>{" "}
                              <p>
                                <strong>Merchant Email:</strong>{" "}
                                {feedback.feedbackMerchant.merchantEmail}
                              </p>
                              <p>
                                <strong>Merchant Phone:</strong>{" "}
                                {feedback.feedbackMerchant.merchantPhone}
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      <Row className="mt-3">
                        {/* Feedback Details */}
                        <Col md={6} xs={12}>
                          <Card
                            className="mb-3"
                            style={{
                              background:
                                "linear-gradient(to right,#BFF098 ,#6FD6FF)", // Gradient colors
                              border: "none",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <Card.Body>
                              <Card.Title className="text-center">
                                Feedback Details
                              </Card.Title>
                              <p>
                                <strong>
                                  Rating:{" "}
                                  <StarRating
                                    rating={feedback.feedbackRating}
                                    color1="#0BABEAFF"
                                    color2="#75F50CFF"
                                  />
                                </strong>
                              </p>
                              <p>
                                <strong>Feedback:</strong> {feedback.feedback}
                              </p>
                              <p>
                                <strong>Feedback Creation Time:</strong>{" "}
                                {new Date(
                                  feedback.feedbackCreationTime
                                ).toLocaleString()}
                              </p>
                              <p>
                                <strong>Feedback Updation Time:</strong>{" "}
                                {new Date(
                                  feedback.feedbackUpdationTime
                                ).toLocaleString()}
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                        {/* Feedback Image */}
                        <Col md={6} xs={12}>
                          <Card
                            className="mb-3"
                            style={{
                              background:
                                "linear-gradient(to right,#BFF098 ,#6FD6FF)",
                              border: "none",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <Card.Body>
                              <Card.Title className="text-center">
                                Feedback Image
                              </Card.Title>
                              {feedback.feedbackImage1 && (
                                <img
                                  //   src={feedback.feedbackImage1} // Use feedback image URL if available
                                  src={feedback.feedbackImage1}
                                  style={{
                                    width: "100%",
                                    height: "175px",
                                    borderRadius: "5px",
                                    marginTop: "10px",
                                  }} // Responsive image
                                />
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      </Row>
                      {/* Questions Section */}
                      {loadingQuestions ? (
                        <div className="text-center">Loading questions...</div>
                      ) : questions.length > 0 ? (
                        <div>
                          <Card
                            className="mt-3"
                            style={{
                              background:
                                "linear-gradient(to right,#BFF098 ,#6FD6FF)",
                              border: "none",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <Card.Body>
                              <Card.Title className="text-center">
                                Questions Asked in Feedback Creation
                              </Card.Title>
                              <p>
                                <strong>Question No:</strong>{" "}
                                {questions[currentQuestionIndex]?.questionId}
                              </p>
                              <p>
                                <strong>Question:</strong>{" "}
                                {
                                  questions[currentQuestionIndex]
                                    ?.questionDescription
                                }
                              </p>
                              <p>
                                <strong>Answer:</strong>{" "}
                                {questions[currentQuestionIndex]?.answer}
                              </p>
                              <div className="d-flex justify-content-between mt-3">
                                <Button
                                  onClick={prevQuestion}
                                  disabled={currentQuestionIndex === 0}
                                >
                                  Previous
                                </Button>
                                <Button
                                  onClick={nextQuestion}
                                  disabled={
                                    currentQuestionIndex ===
                                    questions.length - 1
                                  }
                                >
                                  Next
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      ) : (
                        <div className="mt-3 text-center">
                          No questions available for this feedback.
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
      <br />
      <br />
      <div className="d-flex justify-content-center mb-4">
        <Button variant="success" onClick={exportFeedbackToExcel}>
          Download Feedback Details
        </Button>
      </div>
      <br></br>
      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal message={error} onClose={closeErrorModal} />
      )}
      <br />
      <br />
      <br></br>
    </div>
  );
}
