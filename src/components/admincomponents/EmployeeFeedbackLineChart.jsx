import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import ErrorModal from "../ErrorModal";
import * as XLSX from "xlsx"; // Import the xlsx library

export default function FeedbackLineChart() {
  const [employeeFeedbackData, setEmployeeFeedbackData] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDownloadButton, setShowDownloadButton] = useState(false); // State to control the visibility of the download button

  // Retrieve and parse the stored user data
  const storedUser = localStorage.getItem("authUser");
  const authUser = storedUser ? JSON.parse(storedUser) : null;
  const token = authUser?.token; // Access the token

  const fetchEmployeeFeedbackData = async () => {
    try {
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await fetch(
        "http://192.168.2.7:8080/api/feedback/allfeedbackscount",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEmployeeFeedbackData(data); // Set the fetched data
    } catch (error) {
      console.error("Error fetching employee feedback data:", error);
      setError(error.message); // Set error state
    }
  };

  useEffect(() => {
    fetchEmployeeFeedbackData();
  }, []); // Depend on token to refetch if it changes

  const data = {
    labels: employeeFeedbackData.map((emp) => emp.employeeId),
    datasets: [
      {
        label: "Number of Feedbacks",
        data: employeeFeedbackData.map((emp) => emp.feedbackCount),
        borderColor: "rgba(75, 192, 192, 1)", // Line color
        backgroundColor: "rgba(75, 192, 192, 0.2)", // Fill color under the line
        fill: true,
        tension: 0.3, // Smooth lines
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "aqua", // Set the color of the dataset label
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Feedback Count",
          color: "aqua", // Set the color of the y-axis title
        },
        ticks: {
          color: "aqua", // Set the color of the y-axis ticks
        },
      },
      x: {
        title: {
          display: true,
          text: "Employee ID",
          color: "aqua", // Set the color of the x-axis title
        },
        ticks: {
          color: "aqua", // Set the color of the x-axis ticks
        },
      },
    },
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null); // Clear the error message
  };

  // Function to handle downloading data as Excel file
  const downloadDataAsExcel = () => {
    const formattedData = employeeFeedbackData.map((emp) => ({
      "Employee ID": emp.employeeId,
      "Feedback Count": emp.feedbackCount,
    }));

    // Create a new workbook and add the data to the first worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback Data");

    // Download the Excel file
    XLSX.writeFile(workbook, "Employee_Feedback_Data.xlsx");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: "aqua" }}>
        Employee Feedback Line Chart
      </h2>
      {error && <p style={{ color: "red" }}>{error}</p>}{" "}
      {/* Display error if any */}
      {showModal && <ErrorModal message={error} onClose={closeModal} />}
      <Line data={data} options={options} />
      {/* Toggle button for showing download option */}
      <div className="text-center mt-4">
        <button
          className="btn "
          style={{ color: "aqua" }}
          onClick={() => setShowDownloadButton(!showDownloadButton)}
        >
          {showDownloadButton ? (
            <span>&#9650; Hide Download Option</span> // Up arrow when details are shown
          ) : (
            <span>Convert graph to xlsx file</span> // Down arrow for hidden details
          )}
        </button>

        {showDownloadButton && ( // Conditionally render the download button
          <div className="mt-2">
            <button className="btn btn-success" onClick={downloadDataAsExcel}>
              Download Data as Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
