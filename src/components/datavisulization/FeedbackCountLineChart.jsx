import { Line } from "react-chartjs-2";
import { feedbackCountData } from "../../samplejsondata/CountFeedBackByRating";
import { Chart, registerables } from "chart.js";
import * as XLSX from "xlsx"; // Import the xlsx library for Excel download
import "bootstrap/dist/css/bootstrap.min.css";

// Register all the required Chart.js components
Chart.register(...registerables);

export default function FeedbackCountLineChart() {
  // Prepare the data for the line chart
  const data = {
    labels: ["Above 3.0", "Below 3.0"], // X-axis labels
    datasets: [
      {
        label: "Feedback Count",
        data: [
          feedbackCountData.feedbackCount.above_3_5,
          feedbackCountData.feedbackCount.below_3_5,
        ], // Y-axis values
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
        tension: 0.7, // Smooth lines
        borderWidth: 2, // Adjust border width for visibility
      },
    ],
  };

  // Configure the options for the line chart
  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Feedback Rating Category",
          color: "aqua", // Set x-axis title color to aqua
        },
        ticks: {
          color: "aqua", // Set x-axis ticks color to aqua
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
          color: "aqua", // Set y-axis title color to aqua
        },
        ticks: {
          color: "aqua", // Set y-axis ticks color to aqua
          stepSize: 1,
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
            return `Count: ${tooltipItem.raw}`; // Customize tooltip label
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
    // Prepare the data for Excel export
    const formattedData = [
      {
        "Rating Category": "Above 3.0",
        Count: feedbackCountData.feedbackCount.above_3_5,
      },
      {
        "Rating Category": "Below 3.0",
        Count: feedbackCountData.feedbackCount.below_3_5,
      },
    ];

    // Create a new workbook and add the data to the first worksheet
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Feedback Counts");

    // Download the Excel file
    XLSX.writeFile(workbook, "Feedback_Counts.xlsx");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4" style={{ color: "aqua" }}>
        Feedback Count Line Chart
      </h2>
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
      {/* Download Button */}
      <div className="text-center mt-4">
        <button className="btn btn-success" onClick={downloadDataAsExcel}>
          Download Data as Excel
        </button>
      </div>
    </div>
  );
}
