import { useState, useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import ShowItems from "../ShowItems/ShowItems";
import fire from "../../../config/firebase";
import { addMonths, isAfter, startOfDay } from "date-fns";

const HomeComponents = () => {
  const { isLoading, userFolders, userFiles } = useSelector(
    (state) => ({
      isLoading: state.fileFolders.isLoading,
      userFolders: state.fileFolders.userFolders
        .filter((folder) => folder.data.parent === "root")
        .sort((a, b) => {
          const nameA = a.data.name.replace(
            /\d+/g,
            (match) => `${String(match).padStart(10, "0")}#`
          );
          const nameB = b.data.name.replace(
            /\d+/g,
            (match) => `${String(match).padStart(10, "0")}#`
          );
          return nameA.localeCompare(nameB);
        }),
      userFiles: Array.isArray(state.fileFolders.userFiles)
        ? state.fileFolders.userFiles
            .filter((file) => file.data.parent === "root")
            .sort((a, b) => {
              const nameA = a.data.fileName.replace(
                /\d+/g,
                (match) => `${String(match).padStart(10, "0")}#`
              );
              const nameB = b.data.fileName.replace(
                /\d+/g,
                (match) => `${String(match).padStart(10, "0")}#`
              );
              return nameA.localeCompare(nameB);
            })
        : [],
    }),
    shallowEqual
  );

  const [userData, setUserData] = useState({});
  const [folderData, setFolderData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = fire.firestore().collection("users");
        const querySnapshot = await usersCollection.get();
        const usersData = {};
        querySnapshot.forEach((doc) => {
          const courseCodes = doc.data().courseCode || [];
          courseCodes.forEach((courseCode) => {
            if (!usersData[courseCode]) {
              usersData[courseCode] = [];
            }
            const userData = {
              id: doc.id,
              displayName: doc.data().displayName,
              email: doc.data().email,
              code: courseCode,
              userAccess: doc.data().userAccess ?? true,
              expiryDate: doc.data().expiryDate?.toDate() || null,
              blockedCourses: doc.data().blockedCourses || [],
            };
            usersData[courseCode].push(userData);
          });
        });
        setUserData(usersData);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    const fetchFolderData = async () => {
      try {
        const foldersCollection = fire.firestore().collection("folders");
        const querySnapshot = await foldersCollection.get();
        const foldersData = {};
        querySnapshot.forEach((doc) => {
          const folderId = doc.id;
          const courseCode = doc.data().courseCode;
          const folderName = doc.data().name;
          foldersData[folderId] = { courseCode, folderName };
        });
        setFolderData(foldersData);
      } catch (error) {
        console.error("Error fetching folder data: ", error);
      }
    };

    fetchUsers();
    fetchFolderData();
  }, []);

  const handleToggleUserAccess = async (userId, courseCode) => {
    try {
      const userDocRef = fire.firestore().collection("users").doc(userId);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const newUserAccess = !userData.userAccess;
        let newExpiryDate = userData.expiryDate
          ? userData.expiryDate.toDate()
          : null;
        const today = startOfDay(new Date());

        if (
          newUserAccess &&
          (newExpiryDate === null || isAfter(today, newExpiryDate))
        ) {
          newExpiryDate = addMonths(today, 6);
        }

        await userDocRef.update({
          userAccess: newUserAccess,
          ...(newUserAccess && { expiryDate: newExpiryDate }),
        });

        setUserData((prevData) => {
          const newData = { ...prevData };
          Object.keys(newData).forEach((code) => {
            newData[code] = newData[code].map((user) =>
              user.id === userId
                ? {
                    ...user,
                    userAccess: newUserAccess,
                    expiryDate: newExpiryDate,
                  }
                : user
            );
          });
          return newData;
        });
      }
    } catch (error) {
      console.error("Error toggling user access:", error);
    }
  };

  const handleBlockUser = async (userId, courseCode) => {
    try {
      const userDocRef = fire.firestore().collection("users").doc(userId);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        let blockedCourses = userData.blockedCourses || [];
        if (!blockedCourses.includes(courseCode)) {
          blockedCourses.push(courseCode);
        }

        await userDocRef.update({
          blockedCourses,
        });

        setUserData((prevData) => {
          const newData = { ...prevData };
          Object.keys(newData).forEach((code) => {
            newData[code] = newData[code].map((user) =>
              user.id === userId ? { ...user, blockedCourses } : user
            );
          });
          return newData;
        });
      }
    } catch (error) {
      console.error("Error blocking user:", error);
    }
  };

  const handleUnblockUser = async (userId, courseCode) => {
    try {
      const userDocRef = fire.firestore().collection("users").doc(userId);
      const userDoc = await userDocRef.get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const blockedCourses = (userData.blockedCourses || []).filter(
          (code) => code !== courseCode
        );

        await userDocRef.update({
          blockedCourses,
        });

        setUserData((prevData) => {
          const newData = { ...prevData };
          Object.keys(newData).forEach((code) => {
            newData[code] = newData[code].map((user) =>
              user.id === userId ? { ...user, blockedCourses } : user
            );
          });
          return newData;
        });
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredUserData = Object.keys(userData).reduce((acc, courseCode) => {
    const filteredUsers = userData[courseCode].filter(
      (user) =>
        user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (filteredUsers.length > 0) {
      acc[courseCode] = filteredUsers;
    }
    return acc;
  }, {});

  return (
    <div className="container-fluid">
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          {userFolders.length > 0 && (
            <ShowItems
              title={
                <h2 className="text-primary">
                  <i className="fas fa-folder me-2"></i>Created Folders
                </h2>
              }
              type="folder"
              items={userFolders}
            />
          )}
          {userFiles.length > 0 && (
            <ShowItems
              title={
                <h2 className="text-primary">
                  <i className="fas fa-file me-2"></i>Uploaded Files
                </h2>
              }
              type="file"
              items={userFiles.map((file) => ({
                ...file,
                data: {
                  ...file.data,
                  folderName:
                    folderData[file.data.parent]?.folderName ||
                    "Unknown Folder",
                },
              }))}
            />
          )}
          <div>
            <h2 className="text-primary text-center">User Data</h2>
            {Object.keys(filteredUserData).map((courseCode) => (
              <div key={courseCode} className="card mb-3">
                <div className="card-header bg-primary text-white">
                  <h3>
                    <i className="fas fa-folder me-2"></i>
                    {folderData[courseCode]?.folderName || "Unknown Folder"}
                  </h3>
                  <h4>Course Code: {courseCode}</h4>
                </div>
                <div className="card-body">
                  <ul className="list-group">
                    {filteredUserData[courseCode].map((user) => (
                      <li key={user.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <p>
                              <i className="fas fa-envelope me-2"></i>
                              {user.email}
                            </p>
                            <p>
                              <i className="fas fa-user me-2"></i>
                              {user.displayName}
                            </p>
                            <p>
                              <i className="fas fa-calendar me-2"></i>
                              Expiry Date:{" "}
                              {user.expiryDate
                                ? user.expiryDate.toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            {user.blockedCourses &&
                            user.blockedCourses.includes(courseCode) ? (
                              <button
                                className="btn btn-primary"
                                onClick={() =>
                                  handleUnblockUser(user.id, courseCode)
                                }
                              >
                                <i className="fas fa-unlock me-2"></i>Unblock
                              </button>
                            ) : (
                              <button
                                className="btn btn-warning"
                                onClick={() =>
                                  handleBlockUser(user.id, courseCode)
                                }
                              >
                                <i className="fas fa-ban me-2"></i>Block
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HomeComponents;