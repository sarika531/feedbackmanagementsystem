import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import ErrorModal from "../../components/ErrorModal";
import * as XLSX from "xlsx"; // Import the xlsx library
import "bootstrap/dist/css/bootstrap.min.css";

export default function DeviceFeedBackAvgRatingPieChart() {
  const [deviceData, setDeviceData] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // State for toggling details

  const token = localStorage.getItem("authUser")
    ? JSON.parse(localStorage.getItem("authUser")).token
    : null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://192.168.2.7:8080/api/feedback/average-rating-by-device",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          let errorMessage = "An error occurred";
          if (response.status === 401) {
            errorMessage = "Unauthorized access. Please log in.";
          } else if (response.status === 403) {
            errorMessage = "Access forbidden. You do not have permission.";
          } else if (response.status === 500) {
            errorMessage = "Internal server error. Please try again later.";
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setDeviceData(data);
      } catch (error) {
        console.error("Error fetching device data:", error);
        setError(error.message);
        setShowModal(true);
      }
    };

    fetchData();
  }, [token]);

  // Device names mapping
  const deviceNames = {
    1: "POS",
    2: "MPOS",
    3: "Digital POS",
    4: "Android POS",
    5: "Soundbox",
  };

  // Create an array to ensure all devices 1-5 are represented
  const allDevices = Array.from({ length: 5 }, (_, i) => i + 1).map(
    (deviceId) => {
      const deviceEntry = deviceData.find(
        (device) => device.deviceId === deviceId
      );
      return {
        deviceId,
        averageRating: deviceEntry ? deviceEntry.averageRating : 0, // Set to 0 if not found
      };
    }
  );

  const chartData = {
    labels: allDevices.map(
      (device) =>
        deviceNames[device.deviceId] || `Device ID: ${device.deviceId}`
    ),
    datasets: [
      {
        label: "Average Feedback Rating",
        data: allDevices.map((device) => device.averageRating),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options including label color customization
  const options = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "aqua", // Set legend label color to aqua
        },
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const deviceName = chartData.labels[tooltipItem.dataIndex];
            return ` ${deviceName}: ${tooltipItem.raw}`; // Show average rating in tooltip
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.7)", // Optional: Set border color for segments
      },
    },
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null);
  };

  // Inline styles for the chart container
  const chartContainerStyle = {
    height: "250px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Function to handle downloading data as Excel file
  const downloadDataAsExcel = () => {
    const formattedData = allDevices.map((device) => ({
      "Device ID": device.deviceId,
      "Device Name":
        deviceNames[device.deviceId] || `Device ID: ${device.deviceId}`,
      "Average Rating": device.averageRating,
    }));

    // Create a new workbook and add the data to the first worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Average Ratings");

    // Download the Excel file
    XLSX.writeFile(workbook, "Device_Average_Feedback_Ratings.xlsx");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 " style={{ color: "aqua" }}>
        Average Feedback Rating by Device
      </h2>
      <div style={chartContainerStyle}>
        {allDevices.length > 0 ? (
          <Pie data={chartData} options={options} />
        ) : (
          <p>No data available for the chart.</p>
        )}
      </div>
      {showModal && <ErrorModal message={error} onClose={closeModal} />}

      {/* Toggle Details Button */}
      <div className="text-center mt-4">
        <p
          className="btn "
          style={{ color: "aqua", cursor: "pointer" }}
          onClick={() => setShowDetails(!showDetails)} // Toggle details visibility
        >
          {showDetails ? "Hide Details ▲" : "Convert data into xlsx file"}
        </p>
      </div>

      {/* Conditional Download Button */}
      {showDetails && (
        <div className="text-center mt-4">
          <button className="btn btn-success" onClick={downloadDataAsExcel}>
            Download Data as Excel
          </button>
        </div>
      )}
    </div>
  );
}
