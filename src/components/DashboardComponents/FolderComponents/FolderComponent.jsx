import React, { useEffect } from 'react';
import { shallowEqual, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import ShowItems from "../ShowItems/ShowItems";
import { db } from "../../../config/firebase"; // Make sure to correctly import your Firebase setup
import { doc, updateDoc, getDoc } from "firebase/firestore";

const FolderComponent = () => {
  const { folderId } = useParams();
  const { currentFolderData, childFolders, childFiles } = useSelector(
    (state) => ({
      currentFolderData: state.fileFolders.userFolders.find(
        (folder) => folder.docId === folderId
      )?.data,
      childFolders: state.fileFolders.userFolders.filter(
        (folder) => folder.data.parent === folderId
      ),
      childFiles: state.fileFolders.userFiles.filter(
        (file) => file.data.parent === folderId
      ),
    }),
    shallowEqual
  );

  useEffect(() => {
    const checkAndUpdateDocId = async () => {
      if (currentFolderData) {
        const folderRef = doc(db, "folders", folderId);
        const folderSnapshot = await getDoc(folderRef);

        if (folderSnapshot.exists()) {
          const folderData = folderSnapshot.data();
          if (folderData.docId !== folderId) {
            await updateDoc(folderRef, { docId: folderId });
          }
        }
      }
    };

    checkAndUpdateDocId();
  }, [folderId, currentFolderData]);

  const createdFiles =
    childFiles && childFiles.filter((file) => file.data.url === null);
  const uploadedFiles =
    childFiles && childFiles.filter((file) => file.data.data === null);

  return (
    <div>
      {childFolders.length > 0 || childFiles.length > 0 ? (
        <>
          {childFolders.length > 0 && (
            <ShowItems
              title={"Created Folders"}
              type={"folder"}
              items={childFolders}
            />
          )}
          {/* {createdFiles && createdFiles.length > 0 && (
            <ShowItems
              title={"Created Files"}
              type={"file"}
              items={createdFiles}
            />
          )} */}
          {uploadedFiles && uploadedFiles.length > 0 && (
            <ShowItems
              title={"Uploaded Files"}
              type={"file"}
              items={uploadedFiles}
            />
          )}
        </>
      ) : (
        <h3 className="text-center my-5">Empty Folder</h3>
      )}
    </div>
  );
};

export default FolderComponent;
