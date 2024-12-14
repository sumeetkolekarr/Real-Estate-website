import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import { BiMenuAltRight } from "react-icons/bi";
import fire from "../../../../config/firebase";
import PuffLoader from "react-spinners/PuffLoader";
import OutsideClickHandler from "react-outside-click-handler";

const Header = () => {
  const navigate = useNavigate();
  const [menuOpened, setMenuOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

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

  const toggleMenu = () => {
    setMenuOpened((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PuffLoader color="#36D7B7" />
      </div>
    );
  }

  return (
    <div className="h-wrapper">
      <div className="blur"></div>
      <div
        className="flexCenter paddings innerWidth h-container"
        style={
          menuOpened
            ? { position: "fixed", zIndex: "10", flexDirection: "column" }
            : {
                position: "fixed",
                zIndex: "10",
                flexDirection: "row",
                justifyContent: "space-between",
              }
        }
      >
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
          <div
            className={`h-menu ${menuOpened ? "menu-opened" : ""}`}
            style={menuOpened ? { display: "block" } : { display: "none" }}
          >
            <div className="mobileFlex">
              <a href="#residencies" className="mobileAnchor">
                Residencies
              </a>
              <a href="#value" className="mobileAnchor">
                Our Value
              </a>
              <a href="#contact-us" className="mobileAnchor">
                Contact
              </a>
            </div>

            {isAuthenticated ? (
              <>
                <div className="menu-mobile">
                  {(userEmail === "sumeetkolekarr555@gmail.com" ||
                    userEmail === "kreena1112@gmail.com") && (
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="button"
                    >
                      Dashboard
                    </button>
                  )}
                  {userEmail !== "sumeetkolekarr555@gmail.com" && (
                    <button
                      onClick={() => navigate("/mycourses")}
                      className="button"
                    >
                      Courses
                    </button>
                  )}
                  <button onClick={handleSignOut} className="button">
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="menu-mobile">
                  <button
                    onClick={() => navigate("/register")}
                    className="button"
                  >
                    Sign Up
                  </button>
                  <button onClick={() => navigate("/login")} className="button">
                    Login
                  </button>
                </div>
              </>
            )}
          </div>
        </OutsideClickHandler>

        <div
          className="menu-icon"
          onClick={toggleMenu}
          style={menuOpened ? { display: "none" } : {}}
        >
          <BiMenuAltRight size={30} />
        </div>
      </div>
    </div>
  );
};

export default Header;
