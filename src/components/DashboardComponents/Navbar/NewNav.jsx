// import React from 'react'
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SignOutUser } from "../../../redux/actionCreators/authActionCreator";

const NewNav = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return (
    <>
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarButtonsExample"
            aria-expanded="false"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <a className="navbar-brand" href="#">
            <img src="/images/bootstrap-logo.svg" width="36" />
          </a>
          <div className="collapse navbar-collapse" id="navbarButtonsExample">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" aria-current="page" href="#">
                  Dashboard
                </a>
              </li>
            </ul>
            <div className="d-flex align-items-center ms-auto">
              <button type="button" className="btn btn-default px-3 me-2">
                Login
              </button>
              <button type="button" className="btn btn-primary me-3">
                Sign up for free
              </button>
              <a
                className="btn btn-subtle px-3"
                href="https://github.com/mdbootstrap/mdb-ui-kit"
                role="button"
              >
                <i className="fab fa-github"></i>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NewNav;
