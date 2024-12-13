import * as types from "../actionTypes/fileFolderActionTypes";

const initialState = {
  isLoading: true,
  currentFolder: "root",
  userFolders: [],
  userFiles: [],
  adminFolders: [],
  adminFiles: [],
  newFolderId: null, // Add a new property to the initial state
};

const fileFolderReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.CREATE_FOLDER:
      console.log("New Folder docId:", action.payload.docId);
      return {
        ...state,
        userFolders: [...state.userFolders, action.payload],
        newFolderId: action.payload.docId, // Update the newFolderId property
      };
    case types.ADD_FOLDERS:
      return {
        ...state,
        userFolders: action.payload,
        newFolderId: null, // Reset the newFolderId property
      };
    case types.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case types.CHANGE_FOLDER:
      return {
        ...state,
        currentFolder: action.payload,
        newFolderId: null, // Reset the newFolderId property
      };
    case types.ADD_FILES:
      return {
        ...state,
        userFiles: action.payload,
        newFolderId: null, // Reset the newFolderId property
      };
    case types.DELETE_FILE:
      return {
        ...state,
        userFiles: state.userFiles.filter(file => file.docId !== action.payload),
      };
    case types.DELETE_FOLDER:
      return {
        ...state,
        userFolders: state.userFolders.filter(folder => folder.docId !== action.payload),
      };
    case types.CREATE_FILE:
      return {
        ...state,
        userFiles: [...state.userFiles, action.payload],
        newFolderId: null, // Reset the newFolderId property
      };
    case types.SET_FILE_DATA: {
      const { fileId, data } = action.payload;
      return {
        ...state,
        userFiles: state.userFiles.map((file) =>
          file.docId === fileId ? { ...file, data: { ...file.data, data } } : file
        ),
        newFolderId: null, // Reset the newFolderId property
      };
    }
    case types.UPDATE_ITEM_NAME: {
      const { docId, newName, type } = action.payload;
      if (type === "folder") {
        return {
          ...state,
          userFolders: state.userFolders.map((folder) =>
            folder.docId === docId ? { ...folder, data: { ...folder.data, name: newName } } : folder
          ),
        };
      } else {
        return {
          ...state,
          userFiles: state.userFiles.map((file) =>
            file.docId === docId ? { ...file, data: { ...file.data, name: newName } } : file
          ),
        };
      }
    }
    default:
      return state;
  }
};

export default fileFolderReducer;
export const getNewFolderId = (state) => state.newFolderId;
 // Export a function to access the newFolderId
