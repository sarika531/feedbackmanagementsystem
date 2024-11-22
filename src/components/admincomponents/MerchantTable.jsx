import { Table, Button } from "react-bootstrap"; // Importing Table and Button components
import { useEffect, useState } from "react"; // Importing hooks from React
import ErrorModal from "../../components/ErrorModal"; // Import your ErrorModal component
import * as XLSX from "xlsx"; // Import XLSX for exporting data

// Main functional component for displaying a list of merchants
export default function MerchantTable() {
  const [merchants, setMerchants] = useState([]); // State to hold the list of merchants
  const [error, setError] = useState(null); // State to handle errors
  const [showErrorModal, setShowErrorModal] = useState(false); // State to control visibility of error modal

  // Retrieve and parse the stored user data from local storage
  const storedUser = localStorage.getItem("authUser");
  const authUser = storedUser ? JSON.parse(storedUser) : null; // Parse user data if available
  const token = authUser?.token; // Access the token from parsed user data

  // Function to fetch merchants from the API
  const fetchMerchants = async () => {
    try {
      // Check if the authorization token is present
      if (!token) {
        throw new Error("Authorization token is missing"); // Throw an error if token is not found
      }

      // Make an API request to fetch the list of merchants
      const response = await fetch("http://192.168.2.7:8080/api/merchants/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json", // Specify the content type
          Authorization: `Bearer ${token}`, // Include the authorization token in the request
        },
      });

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

      const data = await response.json(); // Parse the response data into JSON
      setMerchants(data); // Update the merchants state with fetched data
      console.log("the merchants are: ", data); // Log the fetched merchants for debugging
    } catch (error) {
      console.error("Error fetching merchant data:", error); // Log any errors that occur during the fetch
      setError(error.message); // Set the error state with the error message
      setShowErrorModal(true); // Show the error modal
    }
  };

  // useEffect hook to fetch merchants when the component mounts or when the token changes
  useEffect(() => {
    fetchMerchants(); // Fetch merchants data on component mount
  }, [token]); // Dependency array includes token

  // Function to close the error modal and reset error state
  const closeErrorModal = () => {
    setShowErrorModal(false); // Hide the modal
    setError(null); // Reset the error state
  };

  // Function to export merchants to Excel
  const exportMerchantsToExcel = () => {
    // Prepare data for export
    const formattedData = merchants.map((merchant) => ({
      "Merchant Name": merchant.merchantName,
      Email: merchant.merchantEmail,
      "Phone Number": merchant.merchantPhone,
      "Business Name": merchant.merchantBusinessName,
      "Business Type": merchant.merchantBusinessType,
    }));

    // Create a new workbook and add the data to the first worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Merchants");

    // Download the Excel file
    XLSX.writeFile(workbook, "Merchant_Details.xlsx");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-white">Merchant List</h2>

      {/* Table wrapper for scrolling */}
      <div
        className="table-responsive"
        style={{ maxHeight: "400px", overflowY: "auto" }}
      >
        <Table
          striped
          bordered
          hover
          variant="dark" // Set table variant to dark for styling
          className="rounded"
          style={{ cursor: "pointer" }} // Set cursor style for the table
        >
          <thead>
            <tr>
              {/* Table headers for merchant details */}
              <th>Merchant Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Business Name</th>
              <th>Business Type</th>
            </tr>
          </thead>
          <tbody>
            {merchants.length > 0 ? ( // Check if there are any merchants to display
              merchants.map((merchant) => (
                <tr key={merchant.merchantId}>
                  {/* Display merchant details in table cells */}
                  <td>{merchant.merchantName}</td>
                  <td>{merchant.merchantEmail}</td>
                  <td>{merchant.merchantPhone}</td>
                  <td>{merchant.merchantBusinessName}</td>
                  <td>{merchant.merchantBusinessType}</td>
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
      </div>

      {/* Button to export merchants data to Excel, centered below the table */}
      <div className="text-center mt-4">
        <Button variant="success" onClick={exportMerchantsToExcel}>
          Download Merchants Details
        </Button>
      </div>
      <br/>
      <br/>
      <br/>

      {/* Error Modal to display any errors encountered */}
      {showErrorModal && (
        <ErrorModal message={error} onClose={closeErrorModal} /> // Show ErrorModal with the error message
      )}
    </div>
  );
}
