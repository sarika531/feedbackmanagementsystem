import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import mfmslogo from "../../assets/mfmslogo.png";
export default function AdminCreateResource() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadConfirmed, setUploadConfirmed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No file selected. Please select a file.");
      return;
    }
    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      alert("Invalid file type. Please select a valid Excel (.xlsx) file.");
      return;
    }
    const confirmUpload = window.confirm(
      `Are you sure you want to upload this file: ${file.name}?`
    );
    if (confirmUpload) {
      setSelectedFile(file);
      setUploadConfirmed(true);
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(
            new Error(
              "Error parsing the Excel file. Please ensure it is formatted correctly."
            )
          );
        }
      };
      reader.onerror = () =>
        reject(new Error("Failed to read file. Please try again."));
      reader.readAsArrayBuffer(file);
    });
  };

  const validateEmployee = (employee) => {
    const errors = [];

    // Validate Employee Payswiff ID
    if (!employee["Employee Payswiff ID"]) {
      errors.push("Payswiff ID must be provided");
    }

    // Validate Employee Name
    if (!employee["Employee Name"]) {
      errors.push("Name is required");
    }

    // Validate Employee Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!employee["Employee Email"]) {
      errors.push("Email is required");
    } else if (!emailRegex.test(employee["Employee Email"])) {
      errors.push("Email is invalid");
    }

    // Validate Employee Phone Number
    const phoneNumberStr = String(employee["Employee Phone Number"]);
    if (
      !phoneNumberStr ||
      phoneNumberStr.length !== 10 ||
      isNaN(phoneNumberStr)
    ) {
      errors.push("Phone number must be 10 digits long and numeric");
    }

    // Validate Employee Designation
    if (!employee["Employee Designation"]) {
      errors.push("Designation is required");
    }

    // Validate Employee Type
    if (employee["Employee Type"] !== "employee") {
      errors.push('Employee Type must be "employee"');
    }

    return errors; // Return collected errors
  };
  const generatePassword = () => {
    const length = 8; // Minimum desired password length
    const upperCaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerCaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specialChars = "!@#$%^&*()_+[]{}|;:,.<>?";

    const allChars = upperCaseChars + lowerCaseChars + numbers + specialChars;
    let password = "";

    // Ensure at least one character from each category
    password += upperCaseChars.charAt(
      Math.floor(Math.random() * upperCaseChars.length)
    );
    password += lowerCaseChars.charAt(
      Math.floor(Math.random() * lowerCaseChars.length)
    );
    password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    password += specialChars.charAt(
      Math.floor(Math.random() * specialChars.length)
    );

    // Fill the rest of the password length
    for (let i = password.length; i < length; i++) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }

    // Shuffle the password to ensure randomness
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    return password;
  };

  const handleCreateEmployees = async () => {
    if (!selectedFile) {
      alert("No file selected. Please select an Excel (.xlsx) file.");
      return;
    }
    const confirmCreation = window.confirm(
      "Are you sure you want to proceed with employee creation?"
    );
    if (!confirmCreation) return;

    setIsCreating(true);

    try {
      const jsonData = await readFile(selectedFile);
      const resultsArray = [];

      // Retrieve the JWT token from local storage
      const storedUser = localStorage.getItem("authUser");
      const authUser = storedUser ? JSON.parse(storedUser) : null;
      const token = authUser ? authUser.token : null;

      for (let i = 0; i < jsonData.length; i++) {
        const employee = jsonData[i];
        console.log("employee: " + employee);
        const errors = validateEmployee(employee);

        if (errors.length > 0) {
          resultsArray.push({ ...employee, status: "Failed", errors });
        } else {
          const generatedPassword = generatePassword(); // Replace with your password generation logic
          const response = await fetch(
            "http://192.168.2.7:8080/api/employees/create",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`, // Use the token from local storage
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                employeePayswiffId: employee["Employee Payswiff ID"],
                employeeName: employee["Employee Name"],
                employeeEmail: employee["Employee Email"],
                employeePassword: generatedPassword,
                employeePhoneNumber: employee["Employee Phone Number"],
                employeeDesignation: employee["Employee Designation"],
                employeeType: employee["Employee Type"],
              }),
            }
          );

          if (response.ok) {
            resultsArray.push({ ...employee, status: "Created" });
          } else {
            const errorData = await response.json();
            resultsArray.push({
              ...employee,
              status: "Failed",
              errors: [errorData.message],
            });
          }
        }

        setProgress(((i + 1) / jsonData.length) * 100);
      }

      setResults(resultsArray);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseResults = () => {
    setResults([]);
    setUploadConfirmed(false);
    setProgress(0);
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{ marginTop: "80px" }}
    >
      <div
        className="card p-4"
        style={{
          maxWidth: "700px",
          width: "100%",
          background: "linear-gradient(90deg, #4facfe, #00f2fe)",
        }}
      >
        {/* Add Image Here */}
        <img
          src={mfmslogo} // Replace with your image URL
          alt="Descriptive alt text" // Provide a description for accessibility
          className="img-fluid mb-3" // Use Bootstrap class for responsiveness
          style={{ width: "100px", borderRadius: "10px" }}
        />
        {results.length === 0 ? (
          <>
            <h2 className="text-center mb-4" style={{ color: "white" }}>
              Upload Employee Data
            </h2>
            {uploadConfirmed ? (
              <>
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleCreateEmployees}
                  disabled={isCreating}
                >
                  Proceed to Create Employees
                </button>
                {progress > 0 && (
                  <div className="progress mt-3">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{ width: `${progress}%` }}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {Math.round(progress)}%
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <p style={{ color: "white" }}>
                  Please select an Excel (.xlsx) file to create employees.
                </p>
                <input
                  type="file"
                  accept=".xlsx"
                  className="form-control mb-3"
                  onChange={handleFileSelect}
                />
                <button
                  className="btn btn-block"
                  style={{ background: "aqua" }}
                  onClick={() =>
                    document.querySelector("input[type=file]").click()
                  }
                >
                  Browse File
                </button>
              </>
            )}
          </>
        ) : (
          <div>
            <h5>Creation Results:</h5>
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              <ul className="list-group">
                {results.map((result, index) => (
                  <li
                    key={index}
                    className={`list-group-item ${
                      result.status === "Created"
                        ? "list-group-item-success"
                        : "list-group-item-danger"
                    }`}
                  >
                    {result.status === "Created" ? (
                      <span>
                        Employee <strong>{result.Name}</strong> created
                        successfully.
                      </span>
                    ) : (
                      <span>
                        Failed to create employee <strong>{result.Name}</strong>
                        : {result.errors.join(", ")}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="btn btn-secondary mt-3"
              onClick={handleCloseResults}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
