import React, { useEffect, useState } from 'react';
import { Table, Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ErrorModal from '../../components/ErrorModal'; // Assuming you have an ErrorModal component

export default function DeviceTable() {
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);

    const getToken = () => {
        const authUser = JSON.parse(localStorage.getItem('authUser'));
        return authUser ? authUser.token : null;
    };

    const fetchDevices = async () => {
        try {
            const token = getToken();
            if (!token) throw new Error("Authorization token is missing");

            const response = await fetch('http://192.168.2.7:8080/api/devices/all', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                let errorMessage = 'An error occurred';
                if (response.status === 401) {
                    errorMessage = 'Unauthorized: Please log in again.';
                } else if (response.status === 403) {
                    errorMessage = 'Forbidden: You do not have permission to access this resource.';
                } else if (response.status === 500) {
                    errorMessage = 'Server Error: Please try again later.';
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            setDevices(data);
        } catch (error) {
            console.error('Error fetching device data:', error);
            setError(error.message);
            setShowErrorModal(true);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleRowClick = (device) => {
        setSelectedDevice(device);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedDevice(null);
    };

    const closeErrorModal = () => {
        setShowErrorModal(false);
        setError(null);
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4 text-white">Device List</h2>
            <Table striped bordered hover variant="dark" className="rounded">
                <thead>
                    <tr>
                        <th>Device ID</th>
                        <th>Model</th>
                        <th>Manufacturer</th>
                    </tr>
                </thead>
                <tbody>
                    {devices.length > 0 ? (
                        devices.map((device) => (
                            <tr key={device.deviceId} onClick={() => handleRowClick(device)} style={{ cursor: 'pointer' }}>
                                <td>{device.deviceId}</td>
                                <td>{device.deviceModel}</td>
                                <td>{device.deviceManufacturer}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center">Data is not available</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {/* Modal for displaying additional device information */}
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Device Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedDevice && (
                        <div>
                            <p><strong>Device ID:</strong> {selectedDevice.deviceId}</p>
                            <p><strong>Model:</strong> {selectedDevice.deviceModel}</p>
                            <p><strong>Manufacturer:</strong> {selectedDevice.deviceManufacturer}</p>
                            {/* Add any other details you want to display */}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>Close</Button>
                </Modal.Footer>
            </Modal>

            {/* Error Modal */}
            {showErrorModal && <ErrorModal message={error} onClose={closeErrorModal} />}
        </div>
    );
}
