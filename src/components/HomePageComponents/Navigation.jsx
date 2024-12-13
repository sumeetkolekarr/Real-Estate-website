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
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load user's courses from localStorage when component mounts or userCourses changes
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
        // Check if the course is already in user's courses
        if (userCourses.includes(folderCodeValue.trim())) {
          toast.warn("You have already added this course.");
          return;
        }

        let courseDocId = folderCodeValue.trim();
        let isValidCourse = false;

        // First, check if the folderCodeValue is a valid docId
        const docRef = doc(db, "folders", folderCodeValue.trim());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          isValidCourse = true;
        } else {
          // If not, check if it's a valid folderCode by querying the collection
          const q = query(collection(db, "folders"), where("folderCode", "==", folderCodeValue.trim()));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            courseDocId = querySnapshot.docs[0].id; // Get the document ID
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
          
          // Reload the page after 500ms
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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link to="/" className="navbar-brand">
          Numerology Material
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isAuthenticated ? (
              <>
                <li className="nav-item mx-2">
                  <p className="nav-link my-3">
                    <span>Welcome, </span>
                    <span className="text-warning">{user.name}</span>
                  </p>
                </li>
                <li className="nav-item my-3 mx-2">
                  {user.uid === "3iEuFfnyXAXCvpcICqVl7QswgmA3" ||
                  user.uid === "CXjw9gHacUZoLBbZeuUZQv3Jdv83" ? (
                    <NavLink
                      to="/dashboard"
                      className="btn btn-light btn-sm"
                      activeClassName="active"
                    >
                      Dashboard
                    </NavLink>
                  ) : location.pathname === "/" ? (
                    <Button variant="light" size="sm" onClick={handleMyCourses}>
                      My Courses
                    </Button>
                  ) : (
                    <div>
                      <Button
                        variant="light"
                        size="sm"
                        className="me-2"
                        onClick={homeNav}
                      >
                        Home
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        onClick={handleShowModal}
                      >
                        Add Course
                      </Button>
                    </div>
                  )}
                </li>
                <li className="nav-item my-3">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => dispatch(SignOutUser())}
                  >
                    Logout
                  </Button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item my-3 mx-2">
                  <NavLink
                    to="/login"
                    className="btn btn-light btn-sm"
                    activeClassName="active"
                  >
                    Login
                  </NavLink>
                </li>
                <li className="nav-item my-3">
                  <NavLink
                    to="/register"
                    className="btn btn-light btn-sm"
                    activeClassName="active"
                  >
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
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