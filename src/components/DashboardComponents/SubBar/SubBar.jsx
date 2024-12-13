import React, { useEffect, useState } from "react";
import "./SubBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCopy,
  faFolderPlus,
  faUpload,
  faCode,
  faSync,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { changeFolder } from "../../../redux/actionCreators/fileFoldersActionCreator";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const SubBar = ({
  setIsCreateFolderModalOpen,
  setIsCreateFileModalOpen,
  setIsFileUploadModalOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [copySuccess, setCopySuccess] = useState(false);
  const [codeCopySuccess, setCodeCopySuccess] = useState(false);
  const [codeAvailable, setCodeAvailable] = useState(false);
  const [folderCode, setFolderCode] = useState("");
  const [showFolderCodeModal, setShowFolderCodeModal] = useState(false);
  const [folderCodeInput, setFolderCodeInput] = useState("");
  const [folderData, setFolderData] = useState(null);
  const { currentFolder, user, currentFolderData, userFolders } = useSelector(
    (state) => ({
      user: state.auth.user,
      currentFolder: state.fileFolders.currentFolder,
      currentFolderData: state.fileFolders.userFolders.find(
        (folder) => folder.docId === state.fileFolders.currentFolder
      ),
      userFolders: state.fileFolders.userFolders,
    }),
    shallowEqual
  );

  const isExactDashboard = location.pathname === "/dashboard";

  useEffect(() => {
    const fetchFolderCodeAndData = async () => {
      try {
        const docRef = doc(db, "folders", currentFolder);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFolderCode(data.folderCode || "");
          setCodeAvailable(Boolean(data.folderCode));
          setFolderData(data);
        } else {
          setCodeAvailable(false);
          setFolderData(null);
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        setCodeAvailable(false);
        setFolderData(null);
      }
    };

    fetchFolderCodeAndData();
  }, [currentFolder]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 1500);
  };

  const copyCodeToClipboard = () => {
    if (codeAvailable) {
      navigator.clipboard.writeText(folderCode);
      setCodeCopySuccess(true);
      setTimeout(() => setCodeCopySuccess(false), 1500);
    }
  };

  const handleNavigate = (link, id) => {
    navigate(link);
    dispatch(changeFolder(id));
  };

  const handleShowFolderCodeModal = () => {
    setFolderCodeInput(folderCode || "");
    setShowFolderCodeModal(true);
  };

  const handleCloseFolderCodeModal = () => setShowFolderCodeModal(false);

  const handleSaveFolderCode = async () => {
    try {
      const docRef = doc(db, "folders", currentFolder);
      await updateDoc(docRef, { folderCode: folderCodeInput });
      toast.success("Folder code updated successfully.");
      setShowFolderCodeModal(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error updating folder code:", error);
      toast.error("Failed to update folder code.");
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const renderButtons = () => {
    if (isExactDashboard && !codeAvailable) {
      return (
        <>
          <li className="nav-item">
            <button
              className="btn btn-outline-dark"
              onClick={() => setIsFileUploadModalOpen(true)}
            >
              <FontAwesomeIcon icon={faUpload} /> &nbsp; Upload File
            </button>
          </li>
          <li className="nav-item mx-2">
            <button
              className="btn btn-outline-dark"
              onClick={() => setIsCreateFolderModalOpen(true)}
            >
              <FontAwesomeIcon icon={faFolderPlus} /> &nbsp; Create Folder
            </button>
          </li>
          <li className="nav-item">
            <button
              className="btn btn-danger"
              onClick={handleShowFolderCodeModal}
            >
              <FontAwesomeIcon icon={faCode} /> &nbsp; Add Folder Code
            </button>
          </li>
        </>
      );
    } else if (isExactDashboard) {
      return (
        <li className="nav-item">
          <button className="btn btn-danger" onClick={handleReload}>
            <FontAwesomeIcon icon={faSync} /> &nbsp; Reload the Site
          </button>
        </li>
      );
    } else {
      // For all other routes, including /dashboard/folder
      return (
        <>
          <li className="nav-item">
            <button
              className="btn btn-outline-dark"
              onClick={() => setIsFileUploadModalOpen(true)}
            >
              <FontAwesomeIcon icon={faUpload} /> &nbsp; Upload File
            </button>
          </li>
          <li className="nav-item mx-2">
            <button
              className="btn btn-outline-dark"
              onClick={() => setIsCreateFolderModalOpen(true)}
            >
              <FontAwesomeIcon icon={faFolderPlus} /> &nbsp; Create Folder
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn ${
                codeAvailable ? "btn-outline-dark" : "btn-danger"
              }`}
              onClick={codeAvailable ? copyCodeToClipboard : handleShowFolderCodeModal}
            >
              <FontAwesomeIcon icon={faCode} /> &nbsp;
              {codeCopySuccess
                ? "Copied!"
                : codeAvailable
                ? "Copy Code"
                : "Add Folder Code"}
            </button>
          </li>
        </>
      );
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white px-5 py-2">
      <nav className="ms-5" aria-label="breadcrumb">
        <ol className="breadcrumb d-flex align-items-center">
          {/* Breadcrumbs code */}
        </ol>
      </nav>
      {user.uid === "3iEuFfnyXAXCvpcICqVl7QswgmA3" ||
      user.uid === "CXjw9gHacUZoLBbZeuUZQv3Jdv83" ? (
        <div className="navbar-nav ms-auto d-flex flex-row me-5">
          {renderButtons()}
        </div>
      ) : null}

      {/* Folder Code Modal */}
      <Modal show={showFolderCodeModal} onHide={handleCloseFolderCodeModal}>
        <Modal.Header closeButton>
          <Modal.Title>{codeAvailable ? "Edit" : "Add"} Folder Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            value={folderCodeInput}
            onChange={(e) => setFolderCodeInput(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseFolderCodeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveFolderCode}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
};

export default SubBar;
