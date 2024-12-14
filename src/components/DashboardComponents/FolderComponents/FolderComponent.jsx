import React, { useEffect } from 'react';
import { shallowEqual, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import ShowItems from "../ShowItems/ShowItems";
import { db } from "../../../config/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { 
  LucideFolder, 
  LucideFile, 
  LucideInbox 
} from "lucide-react";

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
    <div className="container mx-auto px-4 py-6">
      {childFolders.length > 0 || childFiles.length > 0 ? (
        <div className="space-y-6">
          {childFolders.length > 0 && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4 flex items-center">
                <LucideFolder className="mr-2" />
                <h2 className="text-xl font-semibold">Created Folders</h2>
              </div>
              <div className="p-4">
                <ShowItems
                  title={null}
                  type="folder"
                  items={childFolders}
                />
              </div>
            </div>
          )}

          {uploadedFiles && uploadedFiles.length > 0 && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4 flex items-center">
                <LucideFile className="mr-2" />
                <h2 className="text-xl font-semibold">Uploaded Files</h2>
              </div>
              <div className="p-4">
                <ShowItems
                  title={null}
                  type="file"
                  items={uploadedFiles}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 rounded-lg">
          <LucideInbox className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl text-gray-600 font-medium">Empty Folder</h3>
          <p className="text-gray-500 mt-2">No folders or files in this directory</p>
        </div>
      )}
    </div>
  );
};

export default FolderComponent;