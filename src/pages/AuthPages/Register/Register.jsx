// import React from 'react'
import { Link } from "react-router-dom";

const Register = () => {
  return (
    <div className="container-fluid">
        <h1 className="display-1 my-5 text-center">Register Here</h1>
        <div className="row">
            <div className="col-md-5 mx-auto md-5">
                {/* <RegisterForm /> */}
                <Link to='/login'>
                    Already a Member? Login
                </Link>
            </div>
        </div>
    </div>
  )
}

export default Register