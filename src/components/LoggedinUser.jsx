import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "../componentstyles/navbar.module.css";
import { CgProfile } from "react-icons/cg";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Footer from "./admincomponents/Footer";
import mfmslogo from "../assets/mfmslogo.png";
export default function LoggedinUser() {
  const { authUser, logout } = useAuth();
  const [collapseNav, setCollapseNav] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = () => {
    setCollapseNav(true);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      logout();
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div>
      <div
        className={styles.navbar}
        style={{ backgroundColor: "#0D1117", minHeight: "100vh" }}
      >
        <nav className={`navbar navbar-expand-lg ${styles.navbarcontainer}`}>
          <div className="container-fluid">
            <div className={`navbar-brand ${styles.brand}`} style={{display:"flex",flexDirection:"row",gap:"20px"}}>
             <div> <img
                src={mfmslogo} // Replace with your image URL
                alt="Descriptive alt text" // Provide a description for accessibility
                className="img-fluid mb-3" // Use Bootstrap class for responsiveness
                style={{ width: "100px", borderRadius: "10px" }}
              /></div>
              <div><h4 style={{color:"white",marginTop:"5px"}}><strong>Welcome Employee</strong></h4></div>
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
                  <Link className={styles.navitem_link} to="/loggeduser/home">
                    Home
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/loggeduser/createfeedback"
                  >
                    Create Feedback
                  </Link>
                </li>
                {/* <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/loggeduser/feedbacks"
                  >
                    Feedbacks
                  </Link>
                </li> */}
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/loggeduser/merchantsvisited"
                  >
                    Merchants Visited
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <Link
                    className={styles.navitem_link}
                    to="/loggeduser/employeeprofile"
                  >
                    <CgProfile size={30} color="#52dbbd" />
                  </Link>
                </li>
                <li className={`nav-item ${styles.navitem_li}`}>
                  <button
                    className={`btn ${styles.logout_button}`}
                    onClick={handleLogout}
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

        {/* Adjust the margin to prevent overlap with the footer */}
        <div className={styles.content} style={{ paddingBottom: "60px" }}>
          <Outlet />
        </div>
      </div>

      <Footer />
    </div>
  );
}
