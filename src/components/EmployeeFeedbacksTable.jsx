// import React, { useState } from "react";
// import { Table, Collapse, Card } from "react-bootstrap";
// import { feedbacks } from "../samplejsondata/employeeallfeedbacks";

// export default function EmployeeFeedbacksTable() {
//   const [selectedFeedback, setSelectedFeedback] = useState(null);

//   // Check if the feedback data is available and not empty
//   const isDataAvailable = feedbacks && feedbacks.length > 0;

//   const handleRowClick = (feedbackId) => {
//     setSelectedFeedback(selectedFeedback === feedbackId ? null : feedbackId);
//   };

//   return (
//     <div className="container mt-4">
//       <Card>
//         <Card.Header>
//           <h4 className="text-center">Employee Feedbacks</h4>
//         </Card.Header>
//         <Card.Body>
//           <Table responsive="sm" bordered striped hover>
//             <thead>
//               <tr>
//                 <th>Feedback ID</th>
//                 <th>Merchant ID</th>
//                 <th>Merchant Name</th>
//                 <th>Device Model</th>
//                 <th>Device ID</th>
//               </tr>
//             </thead>
//             <tbody>
//               {isDataAvailable ? (
//                 feedbacks.map((feedback, index) => (
//                   <React.Fragment key={feedback.feedbackId}>
//                     <tr
//                       className={
//                         index % 2 === 0 ? "table-light" : "table-secondary"
//                       }
//                       onClick={() => handleRowClick(feedback.feedbackId)}
//                     >
//                       <td>{feedback.feedbackId}</td>
//                       <td>{feedback.merchantId}</td>
//                       <td>{feedback.merchantName}</td>
//                       <td>{feedback.deviceModel}</td>
//                       <td>{feedback.deviceId}</td>
//                     </tr>
//                     <tr>
//                       <td colSpan="5">
//                         <Collapse in={selectedFeedback === feedback.feedbackId}>
//                           <div>
//                             <div className="mt-2">
//                               <strong>Description:</strong> {feedback.description}
//                             </div>
//                             <div className="mt-2">
//                               <strong>Rating:</strong> {feedback.rating} / 5
//                             </div>
//                           </div>
//                         </Collapse>
//                       </td>
//                     </tr>
//                   </React.Fragment>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="5" className="text-center text-danger">
//                     Data not available
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// }
import React, { useEffect, useState } from 'react';
import { Table, Collapse, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ErrorModal from '../components/ErrorModal'; // Assuming you have an ErrorModal component
import { FaStar } from 'react-icons/fa'; // Import star icon for ratings

const EmployeeFeedbacksTable = () => {
  const [feedbackData, setFeedbackData] = useState([]); // State to store feedback data
  const [error, setError] = useState(null); // State for errors
  const [selectedFeedback, setSelectedFeedback] = useState(null); // State for tracking selected feedback

  // Retrieve and parse the stored user data
  const storedUser = localStorage.getItem("authUser");
  const authUser = storedUser ? JSON.parse(storedUser) : null;
  const token = authUser?.token; // Access the token

  const fetchFeedbackData = async () => {
    try {
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await fetch(`http://192.168.2.7:8080/api/feedback/getallfeedbacks?employeeId=${authUser.employeeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        if (response.status === 401) {
          errorMessage = 'Unauthorized access. Please log in.';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden. You do not have permission.';
        } else if (response.status === 500) {
          errorMessage = 'Internal server error. Please try again later.';
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setFeedbackData(data);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchFeedbackData();
  }, [token]); // Refetch if token changes

  const handleRowClick = (feedbackId) => {
    setSelectedFeedback(selectedFeedback === feedbackId ? null : feedbackId);
  };

  return (
    <div className="container mt-4">
      <Card>
        <Card.Header>
          <h4 className="text-center">Employee Feedbacks</h4>
        </Card.Header>
        <Card.Body>
          <Table responsive="sm" bordered striped hover>
            <thead>
              <tr>
                <th>Feedback ID</th>
                <th>Merchant ID</th>
                <th>Merchant Name</th>
                <th>Device Model</th>
                <th>Device ID</th>
              </tr>
            </thead>
            <tbody>
              {feedbackData.length > 0 ? (
                feedbackData.map((feedback, index) => (
                  <React.Fragment key={feedback.feedbackId}>
                    <tr
                      className={index % 2 === 0 ? "table-light" : "table-secondary"}
                      onClick={() => handleRowClick(feedback.feedbackId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{feedback.feedbackId}</td>
                      <td>{feedback.merchantId}</td>
                      <td>{feedback.feedbackMerchant?.merchantBusinessName}</td>
                      <td>{feedback.feedbackDevice?.deviceModel}</td>
                      <td>{feedback.feedbackDevice?.deviceId}</td>
                    </tr>
                    <tr>
                      <td colSpan="5">
                        <Collapse in={selectedFeedback === feedback.feedbackId}>
                          <div>
                            <div className="mt-2">
                              <strong>Feedback UUID:</strong> {feedback.feedbackUuid}
                            </div>
                            <div className="mt-2">
                              <strong>Created Date:</strong> {new Date(feedback.feedbackCreationTime).toLocaleString()}
                            </div>
                            <div className="mt-2">
                              <strong>Description:</strong> {feedback.feedback}
                            </div>
                            <div className="mt-2">
                              <strong>Rating:</strong> {feedback.feedbackRating} / 5
                            </div>
                            <div className="mt-2">
                              <strong>Feedback Image:</strong>
                              {feedback.feedbackImage1 && (
                                <img src={feedback.feedbackImage1} alt="Feedback" style={{ width: '100%', maxWidth: '300px', borderRadius: '5px' }} />
                              )}
                            </div>
                            <hr />
                            <h5>Device Info</h5>
                            <p><strong>Device Manufacturer:</strong> {feedback.feedbackDevice?.deviceManufacturer}</p>
                            <hr />
                            <h5>Merchant Info</h5>
                            <p><strong>Merchant Email:</strong> {feedback.feedbackMerchant?.merchantEmail}</p>
                            <p><strong>Merchant Phone:</strong> {feedback.feedbackMerchant?.merchantPhone}</p>
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-danger">
                    Data not available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Error Modal */}
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}
    </div>
  );
};

export default EmployeeFeedbacksTable;
