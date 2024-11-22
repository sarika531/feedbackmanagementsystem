import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Image, ListGroup } from "react-bootstrap";
import { FaUser } from "react-icons/fa"; // Import the user icon from react-icons
import "bootstrap/dist/css/bootstrap.min.css";
import mfmslogo from "../../assets/mfmslogo.png";

export default function AdminProfile() {
  const [employee, setEmployee] = useState(null);
  const [error, setError] = useState(null);

  // Function to retrieve the JWT token and email from local storage
  const getTokenAndEmail = () => {
    const storedUser = localStorage.getItem("authUser");
    const authUser = storedUser ? JSON.parse(storedUser) : null;
    return authUser ? { token: authUser.token, email: authUser.username } : null; // Use username as email
  };

  const fetchEmployeeData = async () => {
    try {
      const { token, email } = getTokenAndEmail();
      if (!token || !email) {
        throw new Error("Authorization token or email is missing");
      }

      const response = await fetch(`http://192.168.2.7:8080/api/employees/get?email=${email}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employee data');
      }

      const data = await response.json();
      setEmployee(data);
    } catch (error) {
      console.error('Error fetching employee data:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        {/* Profile Card */}
        <Col xs={12} sm={10} lg={8}>
          <Card className="text-center shadow-lg">
            <Card.Body className="d-flex flex-column flex-md-row align-items-center">
              {/* Profile Image */}
              <div className="mb-3 mb-md-0 me-md-3">
                {employee ? (
                  <Image
                    src={mfmslogo}
                    style={{ width: '50%', height: '150px' }} // Fixed size for the image
                  />
                ) : (
                  <FaUser className="text-primary" size="150" />
                )}
              </div>

              {/* Employee Details */}
              <div className="text-start">
                {employee ? (
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Name:</strong> {employee.employeeName}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Designation:</strong> {employee.employeeDesignation}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Email:</strong> {employee.employeeEmail}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Phone:</strong> {employee.employeePhoneNumber}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Payswiff ID:</strong> {employee.employeePayswiffId}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Employee Type:</strong> {employee.employeeType}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Creation Time:</strong> {new Date(employee.employeeCreationTime).toLocaleString()}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Updation Time:</strong> {new Date(employee.employeeUpdationTime).toLocaleString()}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Roles:</strong> {employee.roles.map(role => role.name).join(', ')}
                    </ListGroup.Item>
                  </ListGroup>
                ) : (
                  <p className="text-danger">Error: {error || "Loading..."}</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
