import React, { useEffect, useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx"; // Import the xlsx library
import ErrorModal from "../../components/ErrorModal"; // Assuming you have an ErrorModal component

export default function EmployeeTable() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Retrieve and parse the stored user data
  const storedUser = localStorage.getItem("authUser");
  const authUser = storedUser ? JSON.parse(storedUser) : null;
  const token = authUser?.token; // Access the token

  const fetchEmployees = async () => {
    try {
      if (!token) {
        throw new Error("Authorization token is missing");
      }

      const response = await fetch("http://192.168.2.7:8080/api/employees/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

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
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      setError(error.message);
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [token]); // Refetch if token changes

  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setError(null);
  };
  const exportToExcel = () => {
    // Filter for employees with employeeType "employee" and prepare data
    const data = employees
      .filter((employee) => employee.employeeType === "employee")
      .map((employee) => ({
        "Payswiff ID": employee.employeePayswiffId,
        Name: employee.employeeName,
        Email: employee.employeeEmail,
        "Phone Number": employee.employeePhoneNumber,
        Designation: employee.employeeDesignation,
        "Employee Type": employee.employeeType,
        "Creation Time": new Date(
          employee.employeeCreationTime
        ).toLocaleString(),
        "Updation Time": new Date(
          employee.employeeUpdationTime
        ).toLocaleString(),
      }));

    // Create a new workbook and add the filtered data to the first worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

    // Download the Excel file
    XLSX.writeFile(workbook, "Employee_Details.xlsx");
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 text-white">Employee List</h2>

      <Table striped bordered hover variant="dark" className="rounded">
        <thead>
          <tr>
            <th>Payswiff ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {employees.length > 0 ? (
            employees.map((employee) => (
              <tr
                key={employee.employeeId}
                onClick={() => handleRowClick(employee)}
                style={{ cursor: "pointer" }}
              >
                <td>{employee.employeePayswiffId}</td>
                <td>{employee.employeeName}</td>
                <td>{employee.employeeEmail}</td>
                <td>{employee.employeePhoneNumber}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                Data is not available
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <br />
      
      <div className="d-flex justify-content-center mb-4">
        <Button variant="success" onClick={exportToExcel}>
          Download Employee Details
        </Button>
        
      </div>
      <br />
        <br />
        <br />
      {/* Modal for displaying additional employee information */}
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Employee Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEmployee && (
            <div>
              <p>
                <strong>Payswiff ID:</strong>{" "}
                {selectedEmployee.employeePayswiffId}
              </p>
              <p>
                <strong>Name:</strong> {selectedEmployee.employeeName}
              </p>
              <p>
                <strong>Email:</strong> {selectedEmployee.employeeEmail}
              </p>
              <p>
                <strong>Phone Number:</strong>{" "}
                {selectedEmployee.employeePhoneNumber}
              </p>
              <p>
                <strong>Designation:</strong>{" "}
                {selectedEmployee.employeeDesignation}
              </p>
              <p>
                <strong>Employee Type:</strong> {selectedEmployee.employeeType}
              </p>
              <p>
                <strong>Creation Time:</strong>{" "}
                {new Date(
                  selectedEmployee.employeeCreationTime
                ).toLocaleString()}
              </p>
              <p>
                <strong>Updation Time:</strong>{" "}
                {new Date(
                  selectedEmployee.employeeUpdationTime
                ).toLocaleString()}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Error Modal */}
      {showErrorModal && (
        <ErrorModal message={error} onClose={closeErrorModal} />
      )}
    </div>
  );
}
