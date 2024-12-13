import * as types from "../actionTypes/authActionTypes";
import fire from "../../config/firebase";
import { toast } from "react-toastify";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { addMonths, startOfDay } from 'date-fns';

const loginUser = (payload) => {
  return {
    type: types.SIGN_IN,
    payload,
  };
};

// const RegisterUser = (payload) => {
//     return{
//          type : types.REGISTER_USER ,
//           payload,
//     }
// }

const LogoutUser = () => {
  return {
    type: types.SIGN_OUT,
  };
};

export const signInUser = (email, password, setSuccess) => (dispatch) => {
  fire
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      setSuccess(true);
      dispatch(
        loginUser({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        })
      );

      const db = getFirestore();
      var ref = doc(db, "users", user.uid);
      const docSnap = await getDoc(ref);

      if (docSnap.exists()) {
        let userData = docSnap.data();
        const updateData = {};

        // Check if signUpDate and expiryDate exist, if not, add them
        if (!userData.signUpDate) {
          const signUpDate = startOfDay(new Date());
          updateData.signUpDate = signUpDate;
          updateData.expiryDate = startOfDay(addMonths(signUpDate, 6));
        } else if (!userData.expiryDate) {
          const signUpDate = new Date(userData.signUpDate.seconds * 1000); // Assuming Firestore timestamp
          updateData.expiryDate = startOfDay(addMonths(signUpDate, 6));
        }

        if (Object.keys(updateData).length > 0) {
          await updateDoc(ref, updateData);
        }

        localStorage.setItem(
          "user-info",
          JSON.stringify({
            code: userData.courseCode,
          })
        );
        localStorage.setItem("user-creds", JSON.stringify(user));
      }
    })
    .catch((error) => {
      toast.error("Invalid Email or Password!");
      console.error(error.code);
      console.error(error.message);
    });
};


export const signUpUser =
  (name, email, password, courseCode, setSuccess) => (dispatch) => {
    fire
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then(async (userCredential) => {
        // User creation successful
        const user = userCredential.user;

        // Update user profile with display name
        await user.updateProfile({
          displayName: name,
        });

        // Calculate expiry date (6 months from signup date)
        const signUpDate = startOfDay(new Date());
        const expiryDate = startOfDay(addMonths(signUpDate, 6));

        // Add user data to Firestore
        const db = fire.firestore();
        const userRef = db.collection("users").doc(user.uid);

        await userRef.set({
          displayName: name,
          email: email,
          courseCode: [],
          userAccess: true,
          signUpDate: signUpDate,
          expiryDate: expiryDate,
          // Add additional fields here if needed
        });

        // Dispatch login action
        dispatch(
          loginUser({
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            // Add additional fields here if needed
          })
        );

        // Set success flag
        setSuccess(true);

        // Alert user about successful registration
        toast.success("User Registered Successfully!");
      })
      .catch((error) => {
        // Handle errors
        if (error.code === "auth/weak-password") {
          toast.warn("The password is too weak.");
        } else if (error.code === "auth/email-already-in-use") {
          toast.warn(
            "This email address is already in use by another account."
          );
        } else if (error.code === "auth/invalid-email") {
          toast.error("Invalid email address.");
        } else {
          // Generic error handling
          alert(error.message);
        }
        console.log(error.code);
        console.log(error.message);
      });
  };


export const SignOutUser = () => (dispatch) => {
  fire
    .auth()
    .signOut()
    .then(() => {
      localStorage.removeItem("user-creds");
      localStorage.removeItem("user-info");
      dispatch(LogoutUser());
    });
};

export const checkIsLoggedIn = () => (dispatch) => {
  fire.auth().onAuthStateChanged((user) => {
    if (user) {
      dispatch(
        loginUser({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        })
      );
    }
  });
};
