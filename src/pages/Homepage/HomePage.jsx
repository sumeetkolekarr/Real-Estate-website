import "./Homepage.css";
import { useState, useEffect, useCallback } from "react";
import { NavigationComponent } from "../../components/HomePageComponents";
import { Container, Row, Col } from "react-bootstrap";
import PuffLoader from "react-spinners/PuffLoader";
import "bootstrap/dist/css/bootstrap.min.css";
import fire from "../../config/firebase";

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ setIsAuthenticated] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prevMode) => !prevMode);
  }, []);

  useEffect(() => {
    const unsubscribe = fire.auth().onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });
    setLoading(false);

    return () => unsubscribe();

  }, []);

  if (loading) {
    return (
      <div className="spinner-container w-100 vh-100 d-flex justify-content-center align-items-center">
        <PuffLoader color={"#D3B603"} loading={loading} size={200} />
      </div>
    );
  }

  return (
    <div className={`home-page ${darkMode ? "dark-mode" : ""}`}>
      <NavigationComponent
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      <Container fluid className="p-5 text-center bg-primary text-light">
        <h1 className="display-4">Welcome to Numerology Material</h1>
        <p className="lead">
          Unlock the secrets of numbers with our comprehensive resources and
          tools.
        </p>
        {/* <Button variant="light" size="lg" className="mt-3" onClick={() => console.log("Get Started clicked")}>
          Get Started
        </Button> */}
      </Container>

      <Container className="my-5">
        <Row>
          <Col md={4} className="mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Learn</h5>
                <p className="card-text">
                  Explore our extensive library of numerology materials and
                  deepen your understanding of the subject.
                </p>
                {/* <Button variant="primary">Explore</Button> */}
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Analyze</h5>
                <p className="card-text">
                  Use our tools to analyze numerological patterns and gain
                  insights into your life and future.
                </p>
                {/* <Button variant="primary">Analyze Now</Button> */}
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Community</h5>
                <p className="card-text">
                  Join our community of numerology enthusiasts and share your
                  experiences and insights.
                </p>
                {/* <Button variant="primary">Join Community</Button> */}
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      <footer
        className={`py-4 ${
          darkMode
            ? "bg-dark text-light w-100 position-absolute bottom-0"
            : "bg-light text-dark w-100 position-absolute bottom-0"
        }`}
      >
        <Container>
          <Row className="text-center">
            <Col>
              <p className="mb-0">
                &copy; 2024 Numerology Material. All rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default HomePage;