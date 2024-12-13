import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import necessary components
// import MaintainancePage from "./pages/Maintainance Page/MaintainancePage";
import Home from "./Frontend/Home/Home";
import SignIn from "./components/AuthComponents/SignIn";
import SignUp from "./components/AuthComponents/SignUp";
import Dashboard from "./pages/DashBoardPage/DashBoard";
import CourseAccess from "./pages/CourseAccess/CourseAccess";
import AccessDenied from "./components/DashboardComponents/AccessDenied/AccessDenied";

import { checkIsLoggedIn } from "./redux/actionCreators/authActionCreator";
import HomePage from "./pages/Homepage/HomePage";

const App = () => {
   const dispatch = useDispatch();

   useEffect(() => {
     dispatch(checkIsLoggedIn());
   }, [dispatch]);

   return (
     <div className="App">
       <ToastContainer />
       <Routes>
         {/* Conditional routing based on maintenance mode */}
         {/* <Route path="/" element={<MaintainancePage />} /> */}
         
         {/* Uncomment these when ready to enable full app functionality */}
         <Route path="/" element={<Home />} />
         <Route path="/homeDummy" element={<HomePage />} />
         <Route path="/login" element={<SignIn />} />
         <Route path="/register" element={<SignUp />} />
         <Route path="/dashboard/*" element={<Dashboard />} />
         <Route path="/accessDenied" element={<AccessDenied />} />
         <Route path="/mycourses" element={<CourseAccess />} />
       </Routes>
     </div>
   );
};

export default App;