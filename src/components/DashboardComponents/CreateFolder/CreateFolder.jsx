import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { createFolder } from "../../../redux/actionCreators/fileFoldersActionCreator";
import { toast } from "react-toastify";

const CreateFolder = ({ setIsCreateFolderModalOpen }) => {
  const [folderName, setFolderName] = useState("");
  const [folderCode, setFolderCode] = useState("");

  const { userFolders, user, currentFolder, currentFolderData } = useSelector(
    (state) => ({
      userFolders: state.fileFolders.userFolders,
      user: state.auth.user,
      currentFolder: state.fileFolders.currentFolder,
      currentFolderData: state.fileFolders.userFolders.find(
        (folder) => folder.docId === state.fileFolders.currentFolder
      ),
    }),
    shallowEqual
  );
  const dispatch = useDispatch();

  const checkFolderAlreadyPresent = (name) => {
    return userFolders
      .filter((folder) => folder.data.parent === currentFolder)
      .some((fldr) => fldr.data.name === name);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (folderName && folderCode) {
      if (folderName.length > 3) {
        if (!checkFolderAlreadyPresent(folderName)) {
          const data = {
            folderCode,
            createdAt: new Date(),
            name: folderName,
            userID: user.uid,
            createdBy: user.name,
            path:
              currentFolder === "root"
                ? []
                : currentFolderData?.data?.path
                ? [...currentFolderData.data.path, currentFolder]
                : [currentFolder],
            parent: currentFolder,
            lastAccessed: null,
            updatedAt: new Date(),
          };
          dispatch(createFolder(data));
          setIsCreateFolderModalOpen(false);
        } else {
          toast.warn("Folder already present");
        }
      } else {
        toast.error("Folder name must be at least 3 characters");
      }
    } else {
      toast.error("Folder name and folder code cannot be empty");
    }
  };

  return (
    <div
      className="col-md-12 position-fixed top-0 left-0 w-100 h-100"
      style={{ background: "rgba(0,0,0,0.4)", zIndex: 9999 }}
      onClick={() => setIsCreateFolderModalOpen(false)}
    >
      <div className="row align-items-center justify-content-center h-100">
        <div
          className="col-md-4 mt-5 bg-white rounded p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="d-flex justify-content-between">
            <h4>Create Folder</h4>
            <button
              className="btn"
              onClick={() => setIsCreateFolderModalOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} className="text-black" size="sm" />
            </button>
          </div>
          <hr />
          <div className="d-flex flex-column align-items-center">
            <form className="mt-3 w-100" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="folderName">Folder Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="folderName"
                  placeholder="Folder Name"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                />
              </div>
              <div className="form-group mt-2">
                <label htmlFor="folderCode">Folder Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="folderCode"
                  placeholder="Folder Code"
                  value={folderCode}
                  onChange={(e) => setFolderCode(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary mt-3 form-control"
              >
                Create Folder
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFolder;
