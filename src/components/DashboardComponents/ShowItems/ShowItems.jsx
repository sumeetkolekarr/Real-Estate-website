import { useState, useCallback, useMemo } from "react";
import { File, Folder, Edit, Trash2, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { changeFolder, deleteFile, updateItemName } from "../../../redux/actionCreators/fileFoldersActionCreator";
import { toast } from "react-toastify";
import fire from "../../../config/firebase";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

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
    <div className="w-full mt-5">
      <h4 className="text-center pb-2 border-b text-xl font-semibold">{title}</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
        {sortedItems.map((item) => (
          <div
            key={item.docId}
            className="bg-white shadow-md rounded-lg p-4 flex flex-col items-center text-center border"
          >
            {type === "folder" ? (
              <Folder className="w-16 h-16 text-blue-500 mb-3" />
            ) : (
              <File className="w-16 h-16 text-gray-500 mb-3" />
            )}
            <p className="text-sm font-medium mb-2 truncate w-full">{item.data.name}</p>
            <div className="flex flex-col space-y-2 w-full">
              <button
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition flex items-center justify-center"
                onClick={() => handleClick(item.docId)}
              >
                View Details
              </button>
              {(user.uid === "3iEuFfnyXAXCvpcICqVl7QswgmA3" ||
                user.uid === "CXjw9gHacUZoLBbZeuUZQv3Jdv83") && (
                <div className="flex flex-col space-y-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition flex items-center justify-center"
                    onClick={() => handleShowEditModal(item)}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition flex items-center justify-center"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </button>
                  {type === "folder" && (
                    <button
                      className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition flex items-center justify-center"
                      onClick={() => handleShowFolderCodeModal(item)}
                    >
                      <Code className="w-4 h-4 mr-1" /> Folder Code
                    </button>
                  )}
                </div>
              )}
            </div>
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
            className="w-full px-3 py-2 border rounded"
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
            className="w-full px-3 py-2 border rounded"
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