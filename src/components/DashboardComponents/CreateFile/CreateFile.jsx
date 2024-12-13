// import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { createFile } from "../../../redux/actionCreators/fileFoldersActionCreator";
import { toast } from "react-toastify";
import Button from '@mui/material/Button';

const CreateFile = ({ setIsCreateFileModalOpen }) => {
  const [fileName, setFileName] = useState("");
  const [success, setSuccess] = useState(false);

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
      setFileName("");
      setSuccess(false);
      setIsCreateFileModalOpen(false);
    }
  }, [setIsCreateFileModalOpen, success]);

  const checkFileAlreadyPresent = (name, ext) => {
    if (!ext) {
      name = name + ".txt";
    }
    const filePresent = userFiles
      .filter((file) => file.data.parent === currentFolder)
      .find((fldr) => fldr.data.name === name);
    if (filePresent) {
      return true;
    } else {
      return false;
    }
  };

  // const handleSubmit = (e) => {
  //   e.peventDefault();
  //   toast.error(`${folderName}`);
  // };

  return (
    <div
      className="col-md-12 position-fixed top-0 left-0 w-100 h-100"
      style={{ background: "rgba(0,0,0,0.4", zIndex: "9999" }}
    >
      <div className="row align-items-center justify-content-center">
        <div className="col-md-4 mt-5 bg-white rounded p-4">
          <div className="d-flex justify-content-between">
            <h4>Create File</h4>
            <Button
              className="btn"
              onClick={() => setIsCreateFileModalOpen(false)}
            >
              <FontAwesomeIcon
                icon={faTimes}
                className="text-black"
                size="sm"
              />
            </Button>
          </div>
          <hr />
          <div className="d-flex flex-column align-items-center">
            <form className="mt-3 w-100">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  id="fileName"
                  placeholder="File Name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  if (fileName) {
                    if (fileName.length > 3) {
                      let extension = false;
                      if (fileName.split(".").length > 1) {
                        extension = true;
                      }
                      if (!checkFileAlreadyPresent(fileName, extension)) {
                        const data = {
                          createdAt: new Date(),
                          name: extension ? fileName : `${fileName}.txt`,
                          userID: user.uid,
                          createdBy: user.name,
                          path:
                            currentFolder === "root"
                              ? []
                              : [
                                  ...currentFolderData.data.path,
                                  currentFolder,
                                ],
                          parent: currentFolder,
                          lastAccessed: null,
                          updatedAt: new Date(),
                          extension: extension ? fileName.split(".")[1] : "txt",
                          data: "",
                          url: null,
                        };
                        dispatch(createFile(data, setSuccess));
                        console.log("data", data);
                      } else {
                        toast.warn("File already Present");
                      }
                    } else {
                      toast.error("File Name must be at least 3 characters");
                    }
                  } else {
                    toast.error("File Name can not be empty");
                  }
                }}
                className="btn btn-primary mt-5 form-control"
              >
                Create File
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFile;
