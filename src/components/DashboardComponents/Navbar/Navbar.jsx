// import React from 'react'
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {useDispatch } from "react-redux";
import { SignOutUser } from "../../../redux/actionCreators/authActionCreator";

const Navbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm p-3">
      <Link to="/" className="navbar-brand ms-5">
        File Management System
      </Link>
      <div className="navbar-nav ms-auto me-5 d-flex flex-row">
        {isAuthenticated ? (
          <>
            <li className="nav-item mx-2">
              <p className="my-0 mt-1 mx-2">
              <span className="text-dark">Welcome, </span>
              <span className="text-primary fw-bold">{user.name}</span>
              </p>
            </li>
            <li className="nav-item mx-2">
              <Link to="/" className="btn btn-primary btn-sm">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <button className="btn btn-danger btn-sm" onClick={()=>dispatch(SignOutUser())}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item mx-2">
              <Link to="/login" className="btn btn-primary btn-sm">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="btn btn-success btn-sm">
                Register
              </Link>
            </li>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
