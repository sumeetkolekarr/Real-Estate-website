import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { SignOutUser } from "../../redux/actionCreators/authActionCreator";
import { Modal, Form, Button } from "react-bootstrap";
import { addCourseCode } from "../../redux/actionCreators/fileFoldersActionCreator";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

const NavigationComponent = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const userId = user.uid;
  const [showModal, setShowModal] = useState(false);
  const [folderCodeValue, setFolderCodeValue] = useState("");
  const [userCourses, setUserCourses] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = JSON.parse(localStorage.getItem("user-info")) || {};
    setUserCourses(storedUserInfo.code || []);
  }, [userCourses]);

  const handleCloseModal = () => {
    setShowModal(false);
    setFolderCodeValue("");
  };

  const handleShowModal = () => setShowModal(true);

  const handleFolderCodeChange = (e) => {
    setFolderCodeValue(e.target.value);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (folderCodeValue.trim() !== "") {
      try {
        if (userCourses.includes(folderCodeValue.trim())) {
          toast.warn("You have already added this course.");
          return;
        }

        let courseDocId = folderCodeValue.trim();
        let isValidCourse = false;

        const docRef = doc(db, "folders", folderCodeValue.trim());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          isValidCourse = true;
        } else {
          const q = query(collection(db, "folders"), where("folderCode", "==", folderCodeValue.trim()));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            courseDocId = querySnapshot.docs[0].id;
            isValidCourse = true;
          }
        }

        if (isValidCourse) {
          const updatedCourses = [...userCourses, courseDocId];
          const storedUserInfo = JSON.parse(localStorage.getItem("user-info")) || {};
          const updatedUserInfo = { ...storedUserInfo, code: updatedCourses };
          localStorage.setItem("user-info", JSON.stringify(updatedUserInfo));
          setUserCourses(updatedCourses);
          dispatch(addCourseCode(userId, courseDocId));
          handleCloseModal();
          toast.success("Course added successfully!");
          
          setTimeout(() => {
            window.location.reload();
          }, 500);
        } else {
          toast.error("Recheck the Folder Code.");
        }
      } catch (error) {
        console.error("Error checking course code:", error);
        if (error.code === 'permission-denied') {
          toast.error("You don't have permission to access this course.");
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      }
    } else {
      toast.error("Please fill out the folder code.");
    }
  };

  const handleMyCourses = () => {
    navigate("/mycourses");
  };

  const homeNav = () => {
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center text-white font-bold text-xl hover:text-blue-200 transition duration-300"
            >
              Numerology Material
            </Link>
          </div>

          <div className="flex items-center md:hidden">
            <button 
              onClick={toggleMobileMenu}
              type="button" 
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-white">
                  Welcome, <span className="text-yellow-300 font-semibold">{user.name}</span>
                </span>

                {user.uid === "3iEuFfnyXAXCvpcICqVl7QswgmA3" ||
                user.uid === "CXjw9gHacUZoLBbZeuUZQv3Jdv83" ? (
                  <NavLink
                    to="/dashboard"
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-600 transition duration-300"
                  >
                    Dashboard
                  </NavLink>
                ) : location.pathname === "/" ? (
                  <button 
                    onClick={handleMyCourses}
                    className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-600 transition duration-300"
                  >
                    My Courses
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button 
                      onClick={homeNav}
                      className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-600 transition duration-300"
                    >
                      Home
                    </button>
                    <button 
                      onClick={handleShowModal}
                      className="px-3 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-500 transition duration-300"
                    >
                      Add Course
                    </button>
                  </div>
                )}

                <button 
                  onClick={() => dispatch(SignOutUser())}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-500 transition duration-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <NavLink
                  to="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-700 hover:bg-blue-600 transition duration-300"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-500 transition duration-300"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden absolute top-16 inset-x-0 bg-blue-800 z-50">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {isAuthenticated ? (
                  <>
                    <div className="text-white px-3 py-2 text-center">
                      Welcome, <span className="text-yellow-300 font-semibold">{user.name}</span>
                    </div>

                    {user.uid === "3iEuFfnyXAXCvpcICqVl7QswgmA3" ||
                    user.uid === "CXjw9gHacUZoLBbZeuUZQv3Jdv83" ? (
                      <NavLink
                        to="/dashboard"
                        className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                      >
                        Dashboard
                      </NavLink>
                    ) : location.pathname === "/" ? (
                      <button 
                        onClick={handleMyCourses}
                        className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                      >
                        My Courses
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={homeNav}
                          className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                        >
                          Home
                        </button>
                        <button 
                          onClick={handleShowModal}
                          className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                        >
                          Add Course
                        </button>
                      </>
                    )}

                    <button 
                      onClick={() => dispatch(SignOutUser())}
                      className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-500 mt-2"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                    >
                      Login
                    </NavLink>
                    <NavLink
                      to="/register"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                    >
                      Register
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Course</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCourseSubmit}>
            <Form.Group>
              <Form.Label>Folder Code</Form.Label>
              <Form.Control
                type="text"
                value={folderCodeValue}
                onChange={handleFolderCodeChange}
                placeholder="Enter folder code or document ID"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCourseSubmit}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
};

export default NavigationComponent;