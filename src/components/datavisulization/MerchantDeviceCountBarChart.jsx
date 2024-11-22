import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import ErrorModal from "../../components/ErrorModal";
import * as XLSX from "xlsx"; // Import the xlsx library for Excel download
import "bootstrap/dist/css/bootstrap.min.css";

export default function MerchantDeviceCountBarChart() {
  const [merchantDeviceData, setMerchantDeviceData] = useState([]);
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
          "http://192.168.2.7:8080/api/MerchantDeviceAssociation/device-count",
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
        setMerchantDeviceData(data);
      } catch (error) {
        console.error("Error fetching merchant device data:", error);
        setError(error.message);
        setShowModal(true);
      }
    };

    fetchData();
  }, [token]);

  // Prepare data for the chart only if merchantDeviceData has items
  const data = {
    labels:
      merchantDeviceData.length > 0
        ? merchantDeviceData.map((merchant) => merchant.merchantId)
        : [],
    datasets: [
      {
        label: "Device Count",
        data:
          merchantDeviceData.length > 0
            ? merchantDeviceData.map((merchant) => merchant.deviceCount)
            : [],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null);
  };

  // Chart options including label color customization
  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Devices",
          color: "aqua", // Set y-axis title color to aqua
        },
        ticks: {
          color: "aqua", // Set y-axis ticks color to aqua
        },
      },
      x: {
        title: {
          display: true,
          text: "Merchants",
          color: "aqua", // Set x-axis title color to aqua
        },
        ticks: {
          color: "aqua", // Set x-axis ticks color to aqua
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "aqua", // Set legend label color to aqua
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            // Customize the tooltip to include device count in aqua
            return `Device Count: ${tooltipItem.raw}`;
          },
          title: function () {
            return ""; // Remove title from tooltip
          },
        },
        titleFont: {
          color: "aqua", // Tooltip title color
        },
        bodyFont: {
          color: "aqua", // Tooltip body color
        },
      },
    },
  };

  // Function to handle downloading data as an Excel file
  const downloadDataAsExcel = () => {
    const formattedData = merchantDeviceData.map((merchant) => ({
      "Merchant ID": merchant.merchantId,
      "Device Count": merchant.deviceCount,
    }));

    // Create a new workbook and add the data to the first worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Device Counts");

    // Download the Excel file
    XLSX.writeFile(workbook, "Merchant_Device_Counts.xlsx");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: "aqua" }}>
        Device Count by Merchant
      </h2>
      <div className="chart-container">
        {merchantDeviceData.length > 0 ? (
          <Bar data={data} options={options} />
        ) : (
          <p>No data available for the chart.</p>
        )}
      </div>
      {showModal && <ErrorModal message={error} onClose={closeModal} />}

      {/* Toggle Details Button */}
      <div className="text-center mt-4">
        <p
          className="btn"
          style={{ cursor: "pointer", color: "aqua" }}
          onClick={() => setShowDetails(!showDetails)} // Toggle details visibility
        >
          {showDetails
            ? "Hide Details ▲"
            : "convert bar graph data into xlsx ▼"}
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
