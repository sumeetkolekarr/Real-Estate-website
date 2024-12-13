import { combineReducers } from 'redux';
import authReducer from './authReducer';
import fileFolderReducer from './fileFoldereducer';

const rootReducer = combineReducers({auth: authReducer, fileFolders: fileFolderReducer})

export default rootReducer;