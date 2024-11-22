import { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { questions as sampleQuestionsData } from "../samplejsondata/questions";
import Select from "react-select"; // Importing the Select component
import StarRatings from "./StarRatings";
import CryptoJS from 'crypto-js';
import { FaStar } from "react-icons/fa";

import ImageUpload from '../components/ImageUpload'
export default function FeedbackForm() {
  const storedUser = localStorage.getItem("authUser");
  const authUser = storedUser ? JSON.parse(storedUser) : null;
  const token = authUser?.token;

  const [feedback, setFeedback] = useState({
    feedbackMerchantId: "",
    feedbackDeviceId: "",
    feedbackImage1: "",
    feedbackRating: "",
    feedback: "",
    feedbackEmployeeId: authUser?.employeeId || "",
  });

  const [errors, setErrors] = useState({});
  const [questions, setQuestions] = useState(sampleQuestionsData);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionAnswers, setQuestionAnswers] = useState([]);
  const [showQuestions, setShowQuestions] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [otherAnswer, setOtherAnswer] = useState("");
  const [fetchError, setFetchError] = useState("");
  const [showSubmissionMessage, setShowSubmissionMessage] = useState(true);
  const [merchants, setMerchants] = useState([]); // State for merchants
  const [loadingMerchants, setLoadingMerchants] = useState(true); // Loading state for merchants
  //ratings
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);


  // Fetch merchants data from API
  useEffect(() => {
    const fetchMerchants = async () => {
      setLoadingMerchants(true);
      try {
        const response = await fetch(
          "http://192.168.2.7:8080/api/merchants/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch merchants");
        }

        const data = await response.json();
        // Format data for react-select
        const formattedMerchants = data.map((merchant) => ({
          value: merchant.merchantId, // Use Merchant ID as value
          label: `${merchant.merchantName}`, // Display name and email
          email: merchant.merchantName, // Keep email for use later
        }));
        setMerchants(formattedMerchants);
      } catch (error) {
        setFetchError(error.message);
      } finally {
        setLoadingMerchants(false);
      }
    };

    fetchMerchants();
  }, [token]);

  const isValidUrl = (url) => {
    const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z0-9]{2,}(\/[^\s]*)?$/i;
    return urlRegex.test(url);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedback({ ...feedback, [name]: value });
  };
  const handleInputChangeMerchant = (selectedOption) => {
    if (selectedOption) {
      // Set Merchant ID and Merchant Email from the selected option
      setFeedback({
        ...feedback,
        feedbackMerchantId: selectedOption.value, // Use the value of the selected option
        feedbackMerchantEmail: selectedOption.email, // Use the email from the selected option
      });
    } else {
      // Clear fields if no option is selected
      setFeedback({
        ...feedback,
        feedbackMerchantId: "",
        feedbackMerchantEmail: "",
      });
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    let isValid = true;

    if (!feedback.feedbackMerchantId) {
      tempErrors.feedbackMerchantId = "Merchant ID is required";
      isValid = false;
    }
    if (!feedback.feedbackDeviceId) {
      tempErrors.feedbackDeviceId = "Device ID is required";
      isValid = false;
    }
    if (!feedback.feedback) {
      tempErrors.feedback = "Feedback Description is required";
      isValid = false;
    }
    // if (!feedback.feedbackRating || feedback.feedbackRating === 0) 
    //  {
    //   tempErrors.feedbackRating = "Rating is required";
    //   isValid = false;
    // }
    // if (feedback.feedbackImage1 && !isValidUrl(feedback.feedbackImage1)) {
    //   tempErrors.feedbackImage1 = "Please enter a valid URL";
    //   isValid = false;
    // }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setShowQuestions(true);
      setSubmissionMessage("");
      setSubmissionError("");
    }
  };

  const handleAnswerChange = (e) => {
    const { value } = e.target;
    setSelectedAnswer(value);
    if (value !== "other") {
      setOtherAnswer(""); // Reset if not "Other"
    }
  };

  const handleOtherChange = (e) => {
    setOtherAnswer(e.target.value);
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion) {
      const answerKey = currentQuestion.id; // Use question ID as key
      const answerObject = {
        questionId: answerKey,
        questionAnswer:
          selectedAnswer === "other" ? otherAnswer : selectedAnswer,
      };

      // Only add the answer if it's not already recorded
      if (!questionAnswers[answerKey]) {
        setQuestionAnswers((prevAnswers) => ({
          ...prevAnswers,
          [answerKey]: answerObject,
        }));
      }

      setSelectedAnswer(""); // Reset selected answer for next question
      setOtherAnswer(""); // Reset other answer for next question
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Restore selected answer if it exists
      const previousAnswer =
        questionAnswers[questions[currentQuestionIndex + 1].id];
      if (previousAnswer) {
        setSelectedAnswer(previousAnswer.questionAnswer);
        if (previousAnswer.questionAnswer === "other") {
          setOtherAnswer(previousAnswer.otherAnswer || "");
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Restore selected answer if it exists
      const previousAnswer =
        questionAnswers[questions[currentQuestionIndex - 1].id];
      if (previousAnswer) {
        setSelectedAnswer(previousAnswer.questionAnswer);
        if (previousAnswer.questionAnswer === "other") {
          setOtherAnswer(previousAnswer.otherAnswer || "");
        }
      } else {
        setSelectedAnswer(""); // Reset if there's no answer
        setOtherAnswer(""); // Reset other answer if no previous answer
      }
    }
  };

  const handleSkip = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const skippedAnswer = {
      questionId: currentQuestion.id,
      questionAnswer: "UN_ANSWERED",
    };
    setQuestionAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentQuestion.id]: skippedAnswer,
    }));
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      // Create the last question object with the answer
      const lastQuestion = {
        questionId: questions[currentQuestionIndex]?.id, // Assuming each question has an `id`
        questionAnswer:
          selectedAnswer === "other" ? otherAnswer : selectedAnswer,
      };

      // Include `lastQuestion` directly in the `body` object by appending to the existing `questionAnswers` state
      const updatedQuestions = [
        ...Object.values(questionAnswers),
        lastQuestion,
      ];
      const body = {
        feedbackRequest: {
          feedbackEmployeeId: parseInt(feedback.feedbackEmployeeId),
          feedbackMerchantId: parseInt(feedback.feedbackMerchantId),
          feedbackDeviceId: parseInt(feedback.feedbackDeviceId),
          feedbackImage1: getDecryptedImageUrl(),
          feedbackRating: parseFloat(rating),
          feedback: feedback.feedback,
        },
        questionAnswers: updatedQuestions, // Convert object back to array
      };

      console.log("The body of feedback request is: ", body);

      const response = await fetch(
        "http://192.168.2.7:8080/api/feedback/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.status === 201) {
        setSubmissionMessage("Feedback submitted successfully!");
        setSubmissionError("");
        resetForm();
        setShowQuestions(false);
      } else {
        handleResponseErrors(response.status);
      }
    } catch (error) {
      setSubmissionError(
        "An error occurred while submitting feedback: " + error.message
      );
      resetForm();
    }
  };

  const handleResponseErrors = (status) => {
    switch (status) {
      case 401:
        setSubmissionError("Not Authenticated");
        resetForm();
        break;
      case 403:
        setSubmissionError("No Permission to perform this action");
        resetForm();
        break;
      case 404:
        setSubmissionError(
          "Resource not found. Please ensure the Merchant ID, Device ID, and Employee ID are correct."
        );
        resetForm();
        break;
      case 500:
        setSubmissionError("Internal Server Error");
        resetForm();
        break;
      default:
        setSubmissionError("Failed to submit feedback. Please try again.");
        resetForm();
    }
  };
  const resetForm = () => {
    setFeedback({
      feedbackMerchantId: "",
      feedbackDeviceId: "",
      feedbackImage1: "",
      feedbackRating: "",
      feedback: "",
      feedbackEmployeeId: authUser?.employeeId || "",
    });
    setErrors({});
    setQuestionAnswers({});
    setCurrentQuestionIndex(0);
    setSelectedAnswer(""); // Reset selected answer
    setOtherAnswer(""); // Reset other answer
  };

  const closeMessage = () => {
    setShowSubmissionMessage(false);
  };
 
  const getDecryptedImageUrl = () => {
    const encryptedUrl = localStorage.getItem('encryptedImageUrl');
    if (encryptedUrl) {
      const decryptedUrl = decryptData(encryptedUrl);
     
      return decryptedUrl;
    }
    return "";
  };

  // Decryption function
  const decryptData = (encryptedData) => {
    const secretKey = 'gopi12345@'; // Same secret key used for encryption
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8); // Decrypt and return the original data
};
// Define messages for each rating
const ratingMessages = [
  "👎 Bad",
  "😐 Could be better",
  "😊 Good",
  "😃 Very Good",
  "🌟 Excellent!",
];

// Assuming feedback is an object stored in state
const handleRating = (rate) => {
  setRating(rate);
};
  return (
    <Container>
      <Row className="justify-content-center">
        <Col xs={12} sm={10} md={8} lg={6}>
          <h4 className="text-center mb-4 text-white">Feedback Form</h4>
          {fetchError && (
            <Alert
              variant="danger"
              onClose={() => {
                setFetchError("");
                window.location.reload();
              }}
              dismissible
            >
              {fetchError}
            </Alert>
          )}
          {submissionError && (
            <Alert
              variant="danger"
              onClose={() => setSubmissionError("")}
              dismissible
            >
              {submissionError}
            </Alert>
          )}
          {submissionMessage && showSubmissionMessage && (
            <Alert variant="info" onClose={closeMessage} dismissible>
              {submissionMessage}
            </Alert>
          )}
          {!showQuestions ? (
            <Form
              onSubmit={handleSubmitFeedback}
              className="bg-white p-4 rounded shadow-sm"
            >
              <Form.Group className="mb-3" controlId="formEmployeeId">
                <Form.Label className="text-dark">Employee ID</Form.Label>
                <Form.Control
                  type="number"
                  name="employeeId"
                  value={feedback.feedbackEmployeeId}
                  readOnly
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formMerchantId">
                <Form.Label className="text-dark">Merchant Name</Form.Label>
                <Select
                  options={merchants}
                  onChange={handleInputChangeMerchant}
                  isLoading={loadingMerchants}
                  placeholder="Select Merchant"
                  isClearable
                  isInvalid={!!errors.feedbackMerchantId}
                />
                {errors.feedbackMerchantId && (
                  <Form.Text className="text-danger">
                    {errors.feedbackMerchantId}
                  </Form.Text>
                )}
                {/* Display the selected Merchant Email here */}
                {feedback.feedbackMerchantEmail && (
                  <Form.Text className="mt-2">
                    Selected Merchant Name:{" "}
                    <strong>{feedback.feedbackMerchantEmail}</strong>
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="formDeviceId">
                <Form.Label className="text-dark">Device Type</Form.Label>
                <Form.Control
                  as="select"
                  name="feedbackDeviceId"
                  value={feedback.feedbackDeviceId}
                  onChange={handleInputChange}
                  isInvalid={!!errors.feedbackDeviceId}
                  required
                >
                  <option value="">Select Device Type</option>
                  <option value="1">MPOS</option>
                  <option value="2">POS</option>
                  <option value="3">DIGITAL POS</option>
                  <option value="4">ANDROID</option>
                  <option value="5">SOUNDBOX</option>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errors.feedbackDeviceId}
                </Form.Control.Feedback>
              </Form.Group>

              

              <Form.Group className="mb-3" controlId="formFeedback">
                <Form.Label className="text-dark">Feedback</Form.Label>
                <Form.Control
                  as="textarea"
                  name="feedback"
                  value={feedback.feedback}
                  onChange={handleInputChange}
                  placeholder="Enter Feedback"
                  rows={4}
                  isInvalid={!!errors.feedback}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.feedback}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="formImage">
                <Form.Label className="text-dark">Upload Image</Form.Label>
                <ImageUpload/>
              
                <Form.Control.Feedback type="invalid">
                  {errors.feedbackImage1}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formRating">
                <Form.Label className="text-dark">Rate Us</Form.Label>
                <div className="">
                  <div className="d-flex justify-content-center mt-3">
                    {[1, 2, 3, 4, 5].map((star, index) => (
                      <FaStar
                        key={index}
                        size={30}
                        onClick={() => handleRating(star)}
                        onMouseEnter={() => setRating(star)}
                        onMouseLeave={() => setRating(rating)}
                        color={star <= rating ? "#ffc107" : "#e4e5e9"}
                        style={{
                          cursor: "pointer",
                          transition: "color 0.2s",
                          margin: "0 5px",
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-3">
                    {rating > 0 && (
                      <p className="lead">{ratingMessages[rating - 1]}</p>
                    )}
                    {/* rating {rating} */}
                  </div>
                </div>

                <Form.Control.Feedback type="invalid">
                  {errors.feedbackRating}
                </Form.Control.Feedback>
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
                Proceed To Feedback Creation
              </Button>
            </Form>
          ) : (
            <div className="bg-white p-4 rounded shadow-sm">
              <h5 className="text-center mb-4 text-dark">
                Answer Feedback Questions
              </h5>
              <Form.Group className="mb-3">
                <Form.Label className="text-dark">
                  {currentQuestionIndex +
                    1 +
                    ".  " +
                    questions[currentQuestionIndex]?.description}
                </Form.Label>
                {Object.keys(questions[currentQuestionIndex].answers).map(
                  (key) => {
                    const optionDescription =
                      questions[currentQuestionIndex].answers[key];
                    return (
                      <Form.Check
                        key={key}
                        type="radio"
                        label={optionDescription} // Correctly getting the description
                        name="answer"
                        value={optionDescription} // Use the option description as the value
                        checked={selectedAnswer === optionDescription} // Compare with option description
                        onChange={handleAnswerChange}
                        required
                      />
                    );
                  }
                )}
                <Form.Check
                  type="radio"
                  label="Other"
                  name="answer"
                  value="other"
                  checked={selectedAnswer === "other"}
                  onChange={handleAnswerChange}
                  required
                />
                {selectedAnswer === "other" && (
                  <Form.Control
                    as="textarea"
                    value={otherAnswer}
                    onChange={handleOtherChange}
                    placeholder="Please specify..."
                    rows={3}
                    required
                  />
                )}
              </Form.Group>

              <div className="d-flex justify-content-between">
                <Button
                  variant="secondary"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <Button variant="warning" onClick={handleSkip}>
                  Skip
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                ) : (
                  <Button variant="success" onClick={handleFinalSubmit}>
                    Submit Final
                  </Button>
                )}
              </div>
            </div>
          )}
        </Col>
      </Row>
      <br />
      <br />
    </Container>
  );
}
