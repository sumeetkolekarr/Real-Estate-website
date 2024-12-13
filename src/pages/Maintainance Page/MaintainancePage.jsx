import 'bootstrap/dist/css/bootstrap.min.css';

const MaintainancePage = () => {
  return (
    <div className="container-fluid bg-light min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-4 mb-4">Website Under Maintenance</h1>
        <div className="mb-4">
          <i className="bi bi-gear-fill text-primary" style={{ fontSize: '5rem' }}></i>
        </div>
        <p className="lead mb-4">
          We are currently performing some maintenance on our website to improve your experience.
        </p>
        <p className="mb-4">
          We apologize for any inconvenience. Please check back soon!
        </p>
        {/* <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div> */}
      </div>
    </div>
  );
};

export default MaintainancePage;