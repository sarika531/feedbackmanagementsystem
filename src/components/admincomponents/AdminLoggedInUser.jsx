import { useState } from "react";
import styles from "../../componentstyles/navbar.module.css";
import { useAuth } from "../../context/AuthContext";
import { CgProfile } from "react-icons/cg";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer";
import mfmslogo from "../../assets/mfmslogo.png";
export default function AdminLoggedInUser() {
  const { authUser, logout } = useAuth(); // Access the logged-in user and logout function
  const [collapseNav, setCollapseNav] = useState(false);
  const navigate = useNavigate(); // To programmatically navigate to a different page

  const handleNavClick = () => {
    setCollapseNav(true);
  };

  const handleLogout = () => {
    // Show a confirmation dialog when the logout button is clicked
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      logout(); // Call the logout function
      navigate("/"); // Redirect to the login page
    }
  };

  return (
    <div style={{ backgroundColor: "#0D1117", minHeight: "100vh" }}>
      <div className={styles.navbar}>
        <nav className={`navbar navbar-expand-lg ${styles.navbarcontainer}`}>
          <div className="container-fluid">
            <div className={`navbar-brand ${styles.brand}`}style={{display:"flex",flexDirection:"row",gap:"20px"}}>
            <div> <img
                src={mfmslogo} // Replace with your image URL
                alt="Descriptive alt text" // Provide a description for accessibility
                className="img-fluid mb-3" // Use Bootstrap class for responsiveness
                style={{ width: "100px", borderRadius: "10px" }}
              /></div>
              <div><h4 style={{color:"white",marginTop:"5px"}}><strong>Welcome Admin</strong></h4></div>
            </div>
            <button
              className={`navbar-toggler outline-0 ${styles.togglebut}`}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
              onClick={handleNavClick}
            >
              <span className={`navbar-toggler-icon ${styles.toggle}`}></span>
            </button>

            <div
              className={`collapse navbar-collapse`}
              id="navbarSupportedContent"
              style={{ display: !collapseNav ? "none" : "block" }}
            >
              <ul className={`navbar-nav ms-auto ${styles.navitems_ul}`}>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link className={styles.navitem_link} to="/aloggeduser/home">
                    Home
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/aloggeduser/createresource"
                  >
                    Create Employees
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/aloggeduser/viewallemployees"
                  >
                    Employees
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/aloggeduser/viewallfeedbacks"
                  >
                    Feedbacks
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/aloggeduser/viewallmerchants"
                  >
                    Merchants
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/aloggeduser/viewalldevices"
                  >
                    Devices
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/aloggeduser/adminprofile"
                  >
                    <CgProfile size={30} color="#52dbbd" />
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <button
                    className={`btn ${styles.logout_button}`}
                    onClick={handleLogout} // Call the new handleLogout function
                    style={{
                      color: "white",
                      backgroundColor: "#52dbbd",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        {/* The child routes will be rendered here */}
        <div className={styles.content}>
          <Outlet />{" "}
          {/* This will render the current page content based on the route */}
        </div>
      </div>
      <Footer />
    </div>
  );
}
