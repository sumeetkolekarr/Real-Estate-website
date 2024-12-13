import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { NavigationComponent } from "../../components/HomePageComponents";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { startOfDay, isAfter } from "date-fns";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const CourseAccess = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseCodes, setCourseCodes] = useState([]);
  const [userAccess, setUserAccess] = useState(null);
  const [blockedCourses, setBlockedCourses] = useState([]);

  // Get authentication state from Redux
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prevMode) => !prevMode);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const checkUserAccess = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserAccess(userData.userAccess);
          setBlockedCourses(userData.blockedCourses || []);

          // Check if expiry date has passed
          const expiryDate = userData.expiryDate
            ? userData.expiryDate.toDate()
            : null;
          const today = startOfDay(new Date());

          if (
            userData.userAccess === false ||
            (expiryDate && isAfter(today, expiryDate))
          ) {
            if (expiryDate && isAfter(today, expiryDate)) {
              await updateDoc(userDocRef, { userAccess: false });
            }
            navigate("/accessDenied");
            return;
          }
        } else {
          console.log("User document does not exist");
          setUserAccess(false);
          navigate("/accessDenied");
          return;
        }
      } catch (error) {
        console.error("Error checking user access:", error);
        setError("Failed to check user access.");
        return;
      }
    };

    const fetchCourses = async () => {
      const storedUserInfo = JSON.parse(localStorage.getItem("user-info"));
      if (storedUserInfo && storedUserInfo.code) {
        try {
          const validCodes = [];
          const results = await Promise.all(
            storedUserInfo.code.map(async (code) => {
              const courseDocRef = doc(db, "folders", code);
              const courseDocSnapshot = await getDoc(courseDocRef);
              if (courseDocSnapshot.exists()) {
                const courseData = courseDocSnapshot.data();
                validCodes.push(code);
                return courseData.name || "Undefined";
              } else {
                return "Undefined";
              }
            })
          );
          setCourseCodes(validCodes);
          setCourses(results);
          localStorage.setItem(
            "user-info",
            JSON.stringify({ code: validCodes })
          );
        } catch (error) {
          setError("Failed to fetch courses.");
        }
      }
    };

    const initializeData = async () => {
      await checkUserAccess();
      if (userAccess !== false) {
        await fetchCourses();
      }
      setLoading(false);
    };

    initializeData();
  }, [isAuthenticated, user, navigate, userAccess]);

  if (!isAuthenticated) {
    return (
      <div className={`home-page ${darkMode ? "dark-mode" : ""}`}>
        <NavigationComponent
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="container my-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <h3>Please Log In or Register</h3>
              <Link to="/login" className="btn btn-primary me-2">
                Log In
              </Link>
              <Link to="/register" className="btn btn-secondary">
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`home-page ${darkMode ? "dark-mode" : ""}`}>
      <NavigationComponent
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            {courses.length > 0 && <h3 className="mb-4">Courses</h3>}
            {loading ? (
              <div className="d-flex justify-content-center">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="sr-only"></span>
                </div>
              </div>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {courses.map((course, index) => {
                  const isBlocked = blockedCourses.includes(courseCodes[index]);
                  return (
                    <div key={index} className="col">
                      <div className="card h-100">
                        <div className="card-body">
                          <h5 className="card-title">{course}</h5>
                          {isBlocked ? (
                            <button className="btn btn-danger" onClick={() => navigate("/accessDenied")}>
                              Access Denied
                            </button>
                          ) : (
                            <Link
                              to={`/dashboard/folder/${courseCodes[index]}`}
                              className="btn btn-primary"
                            >
                              View Course
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAccess;
