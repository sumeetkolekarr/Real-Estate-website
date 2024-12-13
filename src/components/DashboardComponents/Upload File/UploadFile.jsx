import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { uploadFile } from "../../../redux/actionCreators/fileFoldersActionCreator";
import { toast } from "react-toastify";

const UploadFile = ({ setIsFileUploadModalOpen }) => {
  const [file, setFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const { userFiles, user, currentFolder, currentFolderData } = useSelector(
    (state) => ({
      userFiles: state.fileFolders.userFiles,
      user: state.auth.user,
      currentFolder: state.fileFolders.currentFolder,
      currentFolderData: state.fileFolders.userFolders.find(
        (folder) => folder.docId === state.fileFolders.currentFolder
      ),
    }),
    shallowEqual
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (success) {
      setFile(null);
      setSuccess(false);
      setIsFileUploadModalOpen(false);
    }
  }, [setIsFileUploadModalOpen, success]);

  const checkFileAlreadyPresent = (name) => {
    return userFiles
      .filter((file) => file.data.parent === currentFolder)
      .some((fldr) => fldr.data.name === name);
  };

  const getFileExtension = (filename) => {
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename;
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (file) {
      if (!checkFileAlreadyPresent(file.name)) {
        const data = {
          createdAt: new Date(),
          name: file.name,
          userID: user.uid,
          createdBy: user.name,
          path:
            currentFolder === "root"
              ? []
              : [...currentFolderData.data.path, currentFolder],
          parent: currentFolder,
          lastAccessed: null,
          updatedAt: new Date(),
          extension: getFileExtension(file.name),
          data: null,
          url: "",
        };
        dispatch(uploadFile(file, data, setSuccess, setProgress));
      } else {
        toast.warn("File already present");
      }
    } else {
      toast.error("No file selected");
    }
  };

  return (
    <div
      className="col-md-12 position-fixed top-0 left-0 w-100 h-100"
      style={{ background: "rgba(0,0,0,0.4)", zIndex: 9999 }}
      onClick={() => setIsFileUploadModalOpen(false)}
    >
      <div className="row align-items-center justify-content-center h-100">
        <div
          className="col-md-4 mt-5 bg-white rounded p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="d-flex justify-content-between">
            <h4>Upload File</h4>
            <button
              className="btn"
              onClick={() => setIsFileUploadModalOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} className="text-black" size="sm" />
            </button>
          </div>
          <hr />
          <div className="d-flex flex-column align-items-center">
            <form className="mt-3 w-100" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="file">Select File</label>
                <input
                  type="file"
                  className="form-control"
                  id="file"
                  onChange={handleFileChange}
                  aria-describedby="fileHelp"
                />
              </div>
              {progress > 0 && (
                <div className="progress mt-2 w-100">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {progress}%
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary mt-5 form-control"
              >
                Upload File
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadFile;
