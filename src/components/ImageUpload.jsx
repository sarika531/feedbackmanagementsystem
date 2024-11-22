import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { Collapse } from 'react-bootstrap'; // Import Collapse from React Bootstrap
import CryptoJS from 'crypto-js';

const CloudinaryUpload = () => {
    const [imageUrl, setImageUrl] = useState(null);
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showImage, setShowImage] = useState(false); // State to handle image card visibility
    // Encryption function
    const encryptData = (data) => {
        const secretKey = 'gopi12345@'; // Use a strong secret key for encryption
        return CryptoJS.AES.encrypt(data, secretKey).toString(); // Encrypt the data
    };

    
    // Handle file input change
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError(null);  // Clear previous error if any
    };

    // Handle image upload to Cloudinary
    const handleUpload = async () => {
        if (!file) {
            setError("Please select an image file to upload.");
            return;
        }

        setLoading(true); // Start loading indicator
        setError(null); // Clear previous error

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'mfmsimageupload');  // Replace with your upload preset
        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/dwfsnyp9l/image/upload`, // Replace with your Cloudinary cloud name
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (response.ok) {
                const data = await response.json();
                setImageUrl(data.secure_url);
                // Store the encrypted URL in localStorage
                const encryptedUrl = encryptData(data.secure_url);

                localStorage.setItem('encryptedImageUrl', encryptedUrl);
                setLoading(false);
                console.log('Image URL:', data.secure_url);
            } else {
                const errorData = await response.json();
                setLoading(false);

                if (response.status === 401) {
                    setError("Unauthorized: Please check your API key or credentials.");
                } else if (response.status === 403) {
                    setError("Forbidden: Access is denied. Check if the preset allows uploads.");
                } else if (response.status === 500) {
                    setError("Internal Server Error: Something went wrong on the server.");
                } else {
                    setError(`Error ${response.status}: ${errorData.message || "An unknown error occurred."}`);
                }
            }
        } catch (error) {
            setLoading(false);
            setError("Network error: Unable to reach Cloudinary. Please try again.");
            console.error('Error uploading image:', error);
        }
    };

    // Handle image removal
    const handleRemoveImage = () => {
        setImageUrl(null);
        setFile(null);
        setError(null);
        setShowImage(false); // Close the card when image is removed
        // Clear the file input by resetting the file state
        document.getElementById('fileInput').value = '';  // Resetting the file input
    };

    // Toggle card visibility for the image
    const handleToggleImage = () => {
        setShowImage(!showImage);
    };

    return (
        <div className="container mt-4" >

            <div className="row" style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
                {/* Upload Form on the Left */}
                <div className="col-md-10" style={{ display: "flex", flexDirection: "row", gap: "30px" }}>
                    <input
                        id="fileInput"  // Added id to reference the input element
                        type="file"
                        onChange={handleFileChange}
                        className="form-control mb-3"
                    />
                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="btn btn-primary mb-3"
                    >
                        {loading ? 'Uploading...' : 'Upload'}
                    </button>


                </div>
                {error && (
                    <div className="mt-3 alert alert-danger">
                        <strong>{error}</strong>
                    </div>
                )}
                {/* Display Image and Collapsible Card */}
                <div className="col-md-6">
                    {imageUrl && (
                        <>
                            <button
                                className="btn btn-info mb-3"
                                onClick={handleToggleImage}
                            >
                                {showImage ? 'Hide Image' : 'Show Image'}
                            </button>
                            <Collapse in={showImage}>
                                <div className="card">
                                    <div className="card-body text-center" style={{display:"flex",flexDirection:"column"}}>
                                        <img
                                            src={imageUrl}
                                            alt="Uploaded"
                                            className="img-fluid mb-3"
                                            style={{ width: '200px', height: '100px', objectFit: 'cover' }}
                                        />
                                        <button
                                            onClick={handleRemoveImage}
                                            className="btn btn-danger"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                </div>
                            </Collapse>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CloudinaryUpload;
