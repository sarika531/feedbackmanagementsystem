import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap"; // Importing the Table component from React Bootstrap
import ErrorModal from "../components/ErrorModal"; // Assuming you have an ErrorModal component

// Main functional component for displaying merchant visits by an employee
export default function EmployeeMerchantVisitTable() {
  const [merchantVisits, setMerchantVisits] = useState([]); // State to hold the list of merchant visits
  const [error, setError] = useState(null); // State to handle errors
  const [showErrorModal, setShowErrorModal] = useState(false); // State to control visibility of error modal

  // Retrieve and parse the stored user data from local storage
  const storedUser = localStorage.getItem("authUser");
  const authUser = storedUser ? JSON.parse(storedUser) : null; // Parse user data if available
  const token = authUser?.token; // Access the token from parsed user data

  // Function to fetch merchant visits from the API
  const fetchMerchantVisits = async () => {
    try {
      // Check if the authorization token is present
      if (!token) {
        throw new Error("Authorization token is missing"); // Throw an error if token is not found
      }

      // Make an API request to fetch the list of merchant visits
      const response = await fetch(
        `http://192.168.2.7:8080/api/feedback/getallfeedbacks?employeeId=${authUser.employeeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json", // Specify the content type
            Authorization: `Bearer ${token}`, // Include the authorization token in the request
          },
        }
      );

      // Handle response status codes
      if (!response.ok) {
        let errorMessage = "An error occurred"; // Default error message
        // Customize error messages based on status code
        if (response.status === 401) {
          errorMessage = "Unauthorized access. Please log in.";
        } else if (response.status === 403) {
          errorMessage = "Access forbidden. You do not have permission.";
        } else if (response.status === 500) {
          errorMessage = "Internal server error. Please try again later.";
        }
        throw new Error(errorMessage); // Throw error with the appropriate message
      }

      const feedbackData = await response.json(); // Parse the response data into JSON

      // Process the feedback data to extract unique merchant visits
      const uniqueMerchants = {};
      const visits = feedbackData.reduce((acc, feedback) => {
        const merchantId = feedback.feedbackMerchant.merchantId;

        if (!uniqueMerchants[merchantId]) {
          uniqueMerchants[merchantId] = true; // Mark this merchant as encountered
          acc.push({
            merchantId,
            merchantName: feedback.feedbackMerchant.merchantName,
            merchantEmail: feedback.feedbackMerchant.merchantEmail,
            contact: feedback.feedbackMerchant.merchantPhone, // Assuming you have this field
            visitDate: new Date(feedback.feedbackCreationTime).toLocaleString(),
            merchantBusinessName:
              feedback.feedbackMerchant.merchantBusinessName,
            merchantBusinessType:
              feedback.feedbackMerchant.merchantBusinessType,
          });
        }

        return acc;
      }, []);

      setMerchantVisits(visits); // Update the merchant visits state with fetched data
    } catch (error) {
      console.error("Error fetching merchant visits:", error); // Log any errors that occur during the fetch
      setError(error.message); // Set the error state with the error message
      setShowErrorModal(true); // Show the error modal
    }
  };

  // useEffect hook to fetch merchant visits when the component mounts or when the token changes
  useEffect(() => {
    fetchMerchantVisits(); // Fetch merchant visits data on component mount
  }, [token]); // Dependency array includes token

  // Function to close the error modal and reset error state
  const closeErrorModal = () => {
    setShowErrorModal(false); // Hide the modal
    setError(null); // Reset the error state
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-white">
        Merchant Visits by Employee
      </h2>{" "}
      {/* Title for the merchant visits list */}
      <Table
        striped
        bordered
        hover
        variant="dark" // Set table variant to dark for styling
        className="rounded"
      >
        <thead>
          <tr>
            {/* Table headers for merchant visit details */}
            <th>Merchant ID</th>
            <th>Merchant Name</th>
            <th>Email</th>
            <th>Visit Date</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {merchantVisits.length > 0 ? ( // Check if there are any merchant visits to display
            merchantVisits.map((visit) => (
              <tr key={visit.merchantId}>
                {/* Display merchant visit details in table cells */}
                <td>{visit.merchantId}</td>
                <td>{visit.merchantName}</td>
                <td>{visit.merchantEmail}</td>
                <td>{visit.visitDate}</td>
                <td>{visit.contact}</td> {/* Display merchant contact */}
              </tr>
            ))
          ) : (
            <tr>
              {/* Display a message when no data is available */}
              <td colSpan="5" className="text-center">
                Data is not available
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {/* Error Modal to display any errors encountered */}
      {showErrorModal && (
        <ErrorModal message={error} onClose={closeErrorModal} /> // Show ErrorModal with the error message
      )}
    </div>
  );
}
