import React from "react";
import "./Lg.css";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser } from "../../redux/actionCreators/authActionCreator";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
// import Button from '@mui/material/Button';
import fire from "../../config/firebase";

function SignUp() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [code, setCourseCode] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill out all fields");
      return;
    }
    dispatch(signUpUser(name, email, password, code, setSuccess));
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    // send data to the server here
    localStorage.setItem("user-info", JSON.stringify({ code }));

    if (name || email || password || confirmPassword) {
      toast.success("You have filled out all the fields.");
      return;
    }
  };
  React.useEffect(() => {
    if (success) {
      if (user.uid === "3iEuFfnyXAXCvpcICqVl7QswgmA3" || user.uid === 'CXjw9gHacUZoLBbZeuUZQv3Jdv83') {
        navigate("/");
      } else {
        const db = fire.firestore();
        const userDocRef = db.collection("users").doc(user.uid);
        userDocRef
          .get()
          .then((doc) => {
            if (doc.exists) {
              // const userAccess = doc.data().userAccess;
              // if (userAccess === false) {
              //   navigate("/accessDenied");
              // } else {
                // }
                  navigate("/");
            } else {
              console.log("User document does not exist");
            }
          })
          .catch((error) => {
            console.error("Error getting user document:", error);
          });
      }
    }
  }, [navigate, success, user.uid]);

  return (
    <div className="sn_flex">
      <div>
        <Link to="/">
          <h2 className="lg_head">Home</h2>
        </Link>
        <img
          alt="gaming_img"
          src="https://images.pexels.com/photos/2110951/pexels-photo-2110951.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          className="gameimg"
        />
      </div>
      <form className="signin" autoComplete="off" onSubmit={handleSubmit}>
        <p className="signin_head">Sign Up to Access Content</p>
        <div className="snup">
          <input
            className="signin_form"
            type="text"
            name="name"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <input
          className="signin_form"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* <input
          type="text"
          name="code"
          placeholder="Course Code"
          className="signin_form"
          value={code}
          onChange={(e) => setCourseCode(e.target.value)}
        /> */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="signin_form"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          name="passwordConfirmation"
          placeholder="Confirm Password"
          className="signin_form"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {/* <div className="form_remfor">
          <input type="radio" id="remember" name="fav_language" />
          <label for="remember" className="remember_signin">
            Remember Me
          </label>
          <p>Forgot Password?</p>
        </div> */}
        <button type="submit" className="signinbtn">
          Sign Up
        </button>
        <p className="noacc_signin">
          Have an account?{" "}
          <Link to={"/login"}>
            <strong>Sign In Now</strong>
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
