import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { BiMenuAltRight } from "react-icons/bi";
import { getMenuStyles } from "../../utils/common";
import useHeaderColor from "../../hooks/useHeaderColor";
import OutsideClickHandler from "react-outside-click-handler";
import fire from "../../../../config/firebase";
import PuffLoader from "react-spinners/PuffLoader";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpened, setMenuOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const headerColor = useHeaderColor();

  useEffect(() => {
    const unsubscribe = fire.auth().onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserEmail(user.email);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await fire.auth().signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out error", error);
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PuffLoader color="#36D7B7" />
      </div>
    );
  }

  return (
    <div className={`h-wrapper ${headerColor}`}>
      <div className="flexCenter paddings innerWidth h-container">
        <img
          src="/logo.png"
          style={{ marginRight: "32px" }}
          alt="logo"
          width={100}
        />

        <OutsideClickHandler
          onOutsideClick={() => {
            setMenuOpened(false);
          }}
        >
          <div className="h-menu d-flex">
            <a
              style={{ display: "flex", alignItems: "center", margin: "0 9px" }}
              href="#residencies"
            >
              Residencies
            </a>
            <a
              style={{ display: "flex", alignItems: "center", margin: "0 9px" }}
              href="#value"
            >
              Our Value
            </a>
            <a
              style={{ display: "flex", alignItems: "center", margin: "0 9px" }}
              href="#contact-us"
            >
              Contact
            </a>

            {isAuthenticated ? (
              <div className="flex space-x-2" style={{ overflow: "hidden" }}>
                {userEmail === "sumeetkolekarr555@gmail.com" && (
                  <button
                    style={{ margin: "0 10px" }}
                    onClick={() => navigate("/dashboard")}
                    className="button"
                  >
                    Dashboard
                  </button>
                )}
                {userEmail !== "sumeetkolekarr555@gmail.com" && (
                  <button
                    style={{ margin: "0 10px" }}
                    onClick={() => navigate("/mycourses")}
                    className="button"
                  >
                    Courses
                  </button>
                )}
                <button
                  style={{ margin: "0 10px" }}
                  onClick={handleSignOut}
                  className="button"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  style={{ margin: "0 10px" }}
                  onClick={() => navigate("/register")}
                  className="button"
                >
                  Sign Up
                </button>
                <button
                  style={{ margin: "0 10px" }}
                  onClick={() => navigate("/login")}
                  className="button"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </OutsideClickHandler>

        <div
          className="menu-icon"
          onClick={() => setMenuOpened((prev) => !prev)}
        >
          <BiMenuAltRight size={30} />
        </div>
      </div>
    </div>
  );
};

export default Header;
