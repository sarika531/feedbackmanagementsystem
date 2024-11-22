import "bootstrap/dist/css/bootstrap.min.css";
import EmployeeFeedBackLineChart from "../../components/admincomponents/EmployeeFeedbackLineChart";
import DeviceFeedBackAvgRatingPieChart from "../datavisulization/DeviceFeedBackAvgRatingPieChart";
import MerchantDeviceCountBarChart from "../datavisulization/MerchantDeviceCountBarChart";
import DeviceFeedbacksCountBarGraph from "../datavisulization/DeviceFeedbacksCountBarGraph";
import { Button } from "react-bootstrap";
import { useState } from "react";
export default function AdminDashboard() {
  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-white">Admin Dashboard</h2>
      <div className="row">
        {/* Visualization 1 */}
        <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
          <div
            className="card shadow-sm"
            style={{ backgroundColor: "transparent" }}
          >
            <div className="card-body">
              <div className="card-text">
                <EmployeeFeedBackLineChart />
              </div>
            </div>
          </div>
        </div>
        {/* Visualization 2*/}
        <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
          <div
            className="card shadow-sm"
            style={{ backgroundColor: "transparent" }}
          >
            <div className="card-body">
              <div className="card-text">
                <DeviceFeedBackAvgRatingPieChart />
              </div>
            </div>
          </div>
        </div>

        {/* Visualization 3 */}
        <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
          <div
            className="card shadow-sm"
            style={{ backgroundColor: "transparent" }}
          >
            <div className="card-body">
              <div className="card-text">
                <MerchantDeviceCountBarChart />
              </div>
            </div>
          </div>
        </div>
        {/* Visualization 4 */}

        <div className="col-lg-6 col-md-6 col-sm-12 mb-4">
          <div
            className="card shadow-sm"
            style={{ backgroundColor: "transparent" }}
          >
            <div className="card-body">
              <div className="card-text">
                <DeviceFeedbacksCountBarGraph />
              </div>
            </div>
          </div>
        </div>
      </div>
      <br />
      <br />
      <br />
      <br />
    </div>
  );
}
