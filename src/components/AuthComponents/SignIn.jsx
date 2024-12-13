import "./Sign_in.css";
import "./Lg.css";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInUser } from "../../redux/actionCreators/authActionCreator";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import React from "react";
// import Button from '@mui/material/Button';
import fire from "../../config/firebase";

const SignIn = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [success, setSuccess] = React.useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  var userInfo = JSON.parse(localStorage.getItem("user-info"));
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill out all fields");
      return;
    }
    dispatch(signInUser(email, password, setSuccess));
  };

  React.useEffect(() => {
    if (success) {
      // Reload the page
      toast.success("Login is Successful. Redirecting to the Home Page.");
      setTimeout(() => {
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1);
        navigate('/');
      }, 1000);

    }
  }, [success]);

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
    <div className="lg_flex">
      <div>
        <Link to="/">
          <h2 className="sn_head">Home</h2>
        </Link>
        <img
          alt="gaming_img"
          src="https://images.pexels.com/photos/4498792/pexels-photo-4498792.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          className="gameimg"
        />
      </div>
      <form className="signin" autoComplete="off" onSubmit={handleSubmit}>
        <p className="signin_head">Sign In to Access Content</p>
        <input
          className="signin_form"
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="signin_form"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="signinbtn">Sign In</button>
        <p className="noacc_signin">
          Don&apos;t have an account?
          <Link to={"/register"}>
            {" "}
            <strong>Sign Up Now</strong>
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignIn;
