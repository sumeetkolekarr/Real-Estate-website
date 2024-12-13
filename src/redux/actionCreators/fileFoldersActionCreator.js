import fire from "../../config/firebase";
import * as types from "../actionTypes/fileFolderActionTypes";
import { toast } from "react-toastify";

const addFolder = (payload) => ({
  type: types.CREATE_FOLDER,
  payload,
});

const addFolders = (payload) => ({
  type: types.ADD_FOLDERS,
  payload,
});

const setLoading = (payload) => ({
  type: types.SET_LOADING,
  payload,
});

const setChangeFolder = (payload) => ({
  type: types.CHANGE_FOLDER,
  payload,
});

const addFile = (payload) => ({
  type: types.ADD_FILES,
  payload,
});

const setFileData = (payload) => ({
  type: types.SET_FILE_DATA,
  payload,
});

const removeFile = (fileId) => ({
  type: types.DELETE_FILE,
  payload: fileId,
});

const removeFolder = (folderId) => ({
  type: types.DELETE_FOLDER,
  payload: folderId,
});

const updateItem = (payload) => ({
  type: types.UPDATE_ITEM_NAME,
  payload,
});

export const createFolder = (data) => (dispatch) => {
  fire
    .firestore()
    .collection("folders")
    .add(data)
    .then(async (folder) => {
      const folderData = await (await folder.get()).data();
      const folderId = folder.id;
      dispatch(addFolder({ data: folderData, docId: folderId }));
      toast.success("Folder Created Successfully");
    });
};

export const getFolders = () => (dispatch) => {
  dispatch(setLoading(true));
  fire
    .firestore()
    .collection("folders")
    .get()
    .then((folders) => {
      const foldersData = folders.docs.map((folder) => ({
        data: folder.data(),
        docId: folder.id,
      }));
      dispatch(addFolders(foldersData));
      dispatch(setLoading(false));
    });
};

export const changeFolder = (folderId) => (dispatch) => {
  dispatch(setChangeFolder(folderId));
};

export const getFiles = () => (dispatch) => {
  fire
    .firestore()
    .collection("files")
    .get()
    .then((files) => {
      const filesData = files.docs.map((file) => ({
        data: file.data(),
        docId: file.id,
      }));
      dispatch(addFile(filesData));
    });
};

export const createFile = (data, setSuccess) => (dispatch) => {
  fire
    .firestore()
    .collection("files")
    .add(data)
    .then(async (file) => {
      const fileData = await (await file.get()).data();
      const fileId = file.id;
      toast.success("File Created Successfully!");
      dispatch(addFile({ data: fileData, docId: fileId }));
      setSuccess(true);
    })
    .catch(() => {
      setSuccess(false);
    });
};

export const updateFileData = (fileId, data) => (dispatch) => {
  fire
    .firestore()
    .collection("files")
    .doc(fileId)
    .update(data)
    .then(() => {
      dispatch(setFileData({ fileId, data }));
      toast.success("File saved successfully!");
    })
    .catch(() => {
      toast.error("Something went wrong!");
    });
};

export const uploadFile = (file, data, setSuccess, setProgress) => (dispatch) => {
  const uploadFileRef = fire.storage().ref(`files/${data.userId}/${data.name}`);
  uploadFileRef.put(file).on(
    "state_changed",
    (snapshot) => {
      const progress = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      setProgress(progress);

      setTimeout(() => {        
        if (progress === 100) {
          window.location.reload();
        }
      }, 5000);
    },
    (error) => {
      console.log(error);
      toast.error("Upload failed");
      setSuccess(false);
    },
    async () => {
      const fileUrl = await uploadFileRef.getDownloadURL();
      const fullData = { ...data, url: fileUrl };
      fire
        .firestore()
        .collection("files")
        .add(fullData)
        .then(async (file) => {
          const fileData = await (await file.get()).data();
          const fileId = file.id;
          dispatch(addFile({ data: fileData, docId: fileId }));
          toast.success("File Uploaded Successfully");
          setSuccess(true);
        })
        .catch(() => {
          setSuccess(false);
        });
    }
  );
};

export const addCourseCode = (userId, courseCode) => () => {
  const userRef = fire.firestore().collection("users").doc(userId);

  userRef.get().then((doc) => {
    if (doc.exists) {
      const userData = doc.data();
      const existingCourseCode = userData.courseCode || [];
      const newCourseCode = [...new Set([...existingCourseCode, courseCode])];

      userRef
        .update({ courseCode: newCourseCode })
        .then(() => {
          console.log("Course code added successfully!");
        })
        .catch((error) => {
          console.error("Error updating document: ", error);
        });
    } else {
      console.error("User document not found");
    }
  });
};

export const deleteFile = (fileId) => async (dispatch) => {
  try {
    await fire.firestore().collection("files").doc(fileId).delete();
    dispatch(removeFile(fileId));
    toast.success("File deleted successfully.");
  } catch (error) {
    console.error("Error deleting file: ", error);
    toast.error("Failed to delete file.");
  }
};

export const deleteFolder = (folderId) => async (dispatch) => {
  try {
    const filesSnapshot = await fire.firestore().collection("files").where("parent", "==", folderId).get();
    const foldersSnapshot = await fire.firestore().collection("folders").where("parent", "==", folderId).get();

    if (!filesSnapshot.empty || !foldersSnapshot.empty) {
      toast.warn("Files or folders exist in this folder.");
      return;
    }

    await fire.firestore().collection("folders").doc(folderId).delete();
    dispatch(removeFolder(folderId));
    toast.success("Folder deleted successfully.");
  } catch (error) {
    console.error("Error deleting folder: ", error);
    toast.error("Failed to delete folder.");
  }
};

export const updateItemName = (docId, newName, type) => async (dispatch) => {
  try {
    const collection = type === "folder" ? "folders" : "files";
    await fire.firestore().collection(collection).doc(docId).update({ name: newName });
    dispatch(updateItem({ docId, newName, type }));
    // toast.success("Item name updated successfully.");
  } catch (error) {
    console.error("Error updating item name:", error);
    toast.error("Failed to update item name.");
  }
};

