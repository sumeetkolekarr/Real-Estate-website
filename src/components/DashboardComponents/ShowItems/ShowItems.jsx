import { useState, useCallback, useMemo } from "react";
import { faFileAlt, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { changeFolder, deleteFile, updateItemName } from "../../../redux/actionCreators/fileFoldersActionCreator";
import { toast } from "react-toastify";
import fire from "../../../config/firebase";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import "./ShowItems.css";

const ShowItems = ({ items, title, type }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFolderCodeModal, setShowFolderCodeModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newName, setNewName] = useState("");
  const [folderCode, setFolderCode] = useState("");

  const { user } = useSelector(
    (state) => ({
      user: state.auth.user,
    }),
    shallowEqual
  );

  const handleClick = useCallback(
    (itemId) => {
      if (type === "folder") {
        dispatch(changeFolder(itemId));
        navigate(`/dashboard/folder/${itemId}`);
      } else {
        navigate(`/dashboard/file/${itemId}`);
      }
    },
    [dispatch, navigate, type]
  );

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleShowEditModal = (item) => {
    setEditItem(item);
    setNewName(item.data.name);
    setShowEditModal(true);
  };

  const handleEditName = async () => {
    if (!editItem) return;

    try {
      const collection = type === "folder" ? "folders" : "files";
      await fire
        .firestore()
        .collection(collection)
        .doc(editItem.docId)
        .update({ name: newName });

      toast.success(
        `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } name updated successfully.`
      );
      // Update the name in the Redux store
      dispatch(updateItemName(editItem.docId, newName, type));
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Failed to update name.");
    }
  };

  const handleDelete = async (item) => {
    if (type === "folder") {
      try {
        const filesSnapshot = await fire
          .firestore()
          .collection("files")
          .where("parent", "==", item.docId)
          .get();
        const foldersSnapshot = await fire
          .firestore()
          .collection("folders")
          .where("parent", "==", item.docId)
          .get();

        if (!filesSnapshot.empty || !foldersSnapshot.empty) {
          toast.warn("Files or folders exist in this folder.");
          return;
        }

        await fire.firestore().collection("folders").doc(item.docId).delete();
        dispatch({ type: "DELETE_FOLDER", payload: item.docId });
        toast.success("Folder deleted successfully.");
      } catch (error) {
        console.error("Error deleting folder: ", error);
        toast.error("Failed to delete folder.");
      }
    } else {
      dispatch(deleteFile(item.docId));
    }
  };

  const handleCloseFolderCodeModal = () => setShowFolderCodeModal(false);
  const handleShowFolderCodeModal = (item) => {
    setEditItem(item);
    setFolderCode(item.data.folderCode || "");
    setShowFolderCodeModal(true);
  };

  const handleSaveFolderCode = async () => {
    if (!editItem) return;

    try {
      await fire
        .firestore()
        .collection("folders")
        .doc(editItem.docId)
        .update({ folderCode });

      toast.success("Folder code updated successfully.");
      handleCloseFolderCodeModal();
    } catch (error) {
      console.error("Error updating folder code:", error);
      toast.error("Failed to update folder code.");
    }
  };

  const sortedItems = useMemo(() => {
    return items.slice().sort((a, b) => a.data.createdAt - b.data.createdAt);
  }, [items]);

  return (
    <div className="w-100 mt-5">
      <h4 className="text-center border-bottom">{title}</h4>
      <div className="row gap-2 p-4 flex-wrap d-flex align-items-center justify-content-center">
        {sortedItems.map((item) => (
          <div
            key={item.docId}
            className="col-md-2 py-3 text-center border d-flex flex-column"
          >
            <FontAwesomeIcon
              icon={type === "folder" ? faFolder : faFileAlt}
              size="4x"
              className="mb-3"
            />
            <p>{item.data.name}</p>
            <button
              className="btn btn-success mb-2"
              onClick={() => handleClick(item.docId)}
            >
              View Details
            </button>
            {(user.uid === "3iEuFfnyXAXCvpcICqVl7QswgmA3" ||
              user.uid === "CXjw9gHacUZoLBbZeuUZQv3Jdv83") && (
              <>
                <button
                  className="btn btn-primary mb-2"
                  onClick={() => handleShowEditModal(item)}
                >
                  Edit Name
                </button>
                <button
                  className="btn btn-danger mb-2"
                  onClick={() => handleDelete(item)}
                >
                  Delete
                </button>
                {type === "folder" && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => handleShowFolderCodeModal(item)}
                  >
                    Folder Code
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Edit Name Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseEditModal}>
            Close
          </Button>
          <Button variant="primary" onClick={handleEditName}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Folder Code Modal */}
      <Modal show={showFolderCodeModal} onHide={handleCloseFolderCodeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Folder Code</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control"
            value={folderCode}
            onChange={(e) => setFolderCode(e.target.value)}
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
    </div>
  );
};

export default ShowItems;
