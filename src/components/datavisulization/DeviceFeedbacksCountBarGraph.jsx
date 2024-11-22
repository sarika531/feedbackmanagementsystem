import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import ErrorModal from "../../components/ErrorModal";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx"; // Import xlsx library

const DeviceFeedbacksCountBarGraph = () => {
  const [deviceFeedbacks, setDeviceFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // State to toggle details visibility

  const token = localStorage.getItem("authUser")
    ? JSON.parse(localStorage.getItem("authUser")).token
    : null;

  const expectedDevices = [1, 2, 3, 4, 5]; // List of expected device IDs
  const deviceNames = {
    1: "POS",
    2: "MPOS",
    3: "Digital POS",
    4: "Android POS",
    5: "Soundbox",
  }; // Mapping device IDs to names

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://192.168.2.7:8080/api/feedback/device-count",
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
        setDeviceFeedbacks(data);
      } catch (error) {
        console.error("Error fetching device feedback counts:", error);
        setError(error.message);
        setShowModal(true);
      }
    };

    fetchData();
  }, [token]);

  // Prepare data to ensure all expected devices are represented
  const feedbackCounts = expectedDevices.map((deviceId) => {
    const deviceFeedback = deviceFeedbacks.find(
      (fb) => fb.deviceId === deviceId
    );
    return {
      deviceId: deviceId,
      feedbackCount: deviceFeedback ? deviceFeedback.feedbackCount : 0,
      deviceName: deviceNames[deviceId], // Get the device name from the mapping
    };
  });

  const chartData = {
    labels: feedbackCounts.map((device) => device.deviceName), // Use device names here
    datasets: [
      {
        label: "Feedback Count",
        data: feedbackCounts.map((device) => device.feedbackCount),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Feedbacks",
          color: "aqua",
        },
        ticks: {
          color: "aqua",
        },
      },
      x: {
        title: {
          display: true,
          text: "Devices",
          color: "aqua",
        },
        ticks: {
          color: "aqua",
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "aqua",
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `Count: ${tooltipItem.raw}`;
          },
          title: function () {
            return "";
          },
        },
        titleFont: {
          color: "aqua",
        },
        bodyFont: {
          color: "aqua",
        },
      },
    },
  };

  const handleDownload = () => {
    // Prepare the data for the Excel file
    const formattedData = feedbackCounts.map((device) => ({
      Device: device.deviceName,
      "Feedback Count": device.feedbackCount,
    }));

    // Create a new workbook and a worksheet
    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Device Feedbacks");

    // Generate a file and download it
    XLSX.writeFile(wb, "Device_Feedbacks_Count.xlsx");
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: "aqua" }}>
        Feedback Count by Device
      </h2>

      <div className="chart-container">
        {feedbackCounts.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <p>No data available for the chart.</p>
        )}
      </div>
      <div className="text-center mt-4">
        <p
          className="btn"
          style={{ color: "aqua", cursor: "pointer" }}
          onClick={() => {
            handleDownload(); // Call download function
            setShowDetails(!showDetails); // Toggle details visibility
          }}
        >
          Convert data into xlsx file
        </p>
      </div>
      {showModal && <ErrorModal message={error} onClose={closeModal} />}
    </div>
  );
};

export default DeviceFeedbacksCountBarGraph;
