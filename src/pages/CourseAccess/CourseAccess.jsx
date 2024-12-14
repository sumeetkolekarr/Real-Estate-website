import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { startOfDay, isAfter } from "date-fns";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Moon, Sun, Lock, Unlock } from "lucide-react";
import Navigation from '../../components/HomePageComponents/Navigation'

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
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} transition-colors duration-300`}>
       <Navigation />
        
        <div className="container mx-auto px-4 py-16 flex justify-center items-center">
          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h3 className="text-2xl font-semibold mb-6">Please Log In or Register</h3>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/login" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} transition-colors duration-300`}>
      <Navigation />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {courses.length > 0 && (
            <h3 className="text-3xl font-bold mb-8 text-center dark:text-white">
              Your Courses
            </h3>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course, index) => {
                const isBlocked = blockedCourses.includes(courseCodes[index]);
                return (
                  <div 
                    key={index} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="p-6">
                      <h5 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        {course}
                      </h5>
                      {isBlocked ? (
                        <button 
                          onClick={() => navigate("/accessDenied")}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Lock className="w-5 h-5" />
                          Access Denied
                        </button>
                      ) : (
                        <Link
                          to={`/dashboard/folder/${courseCodes[index]}`}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Unlock className="w-5 h-5" />
                          View Course
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseAccess;