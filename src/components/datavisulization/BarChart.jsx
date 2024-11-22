// src/components/BarChart.js
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import PropTypes from "prop-types";

// Register necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ data }) => {
  const chartData = {
    labels: data.map((item) => item.year), // Dates for the x-axis
    datasets: [
      {
        label: "Merchants Visited",
        data: data.map((item) => item.merchantsVisited), // Number of merchants visited per date
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true, // Makes the chart responsive
    plugins: {
      title: {
        display: true,
        text: "Merchants Visits In Last 5-Years",
      },
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        barThickness: 15, // Custom width of the bars (pillars)
        categoryPercentage: 0.5, // Decreases the width of the bars (pillars)
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        max: 25, // Increase the max value to make the bars taller
      },
    },
    maintainAspectRatio: false, // Ensures the chart resizes according to the container
  };

  return (
    <div className="chart-container">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};
// Prop types validation
BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      merchantsVisited: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default BarChart;
