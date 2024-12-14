import { useState, useEffect } from "react";
import { shallowEqual, useSelector } from "react-redux";
import ShowItems from "../ShowItems/ShowItems";
import fire from "../../../config/firebase";
import { addMonths, isAfter, startOfDay } from "date-fns";
import { 
  LucideFolder, 
  LucideFile, 
  LucideMail, 
  LucideUser, 
  LucideCalendar, 
  LucideUnlock, 
  LucideBan 
} from "lucide-react";

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
    <div className="container mx-auto px-4 py-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          {userFolders.length > 0 && (
            <ShowItems
              title={
                <h2 className="text-2xl font-bold text-blue-600 flex items-center mb-4">
                  <LucideFolder className="mr-2" />
                  Created Folders
                </h2>
              }
              type="folder"
              items={userFolders}
            />
          )}
          {userFiles.length > 0 && (
            <ShowItems
              title={
                <h2 className="text-2xl font-bold text-blue-600 flex items-center mb-4">
                  <LucideFile className="mr-2" />
                  Uploaded Files
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
            <h2 className="text-2xl font-bold text-blue-600 text-center mb-6">User Data</h2>
            {Object.keys(filteredUserData).map((courseCode) => (
              <div key={courseCode} className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                <div className="bg-blue-600 text-white p-4">
                  <div className="flex items-center mb-2">
                    <LucideFolder className="mr-2" />
                    <h3 className="text-xl font-semibold">
                      {folderData[courseCode]?.folderName || "Unknown Folder"}
                    </h3>
                  </div>
                  <h4 className="text-sm">Course Code: {courseCode}</h4>
                </div>
                <div className="p-4">
                  {filteredUserData[courseCode].map((user) => (
                    <div 
                      key={user.id} 
                      className="flex justify-between items-center border-b last:border-b-0 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="flex items-center text-gray-700 mb-1">
                          <LucideMail className="mr-2 text-blue-500" />
                          {user.email}
                        </p>
                        <p className="flex items-center text-gray-700 mb-1">
                          <LucideUser className="mr-2 text-blue-500" />
                          {user.displayName}
                        </p>
                        <p className="flex items-center text-gray-700">
                          <LucideCalendar className="mr-2 text-blue-500" />
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
                            className="btn bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors"
                            onClick={() =>
                              handleUnblockUser(user.id, courseCode)
                            }
                          >
                            <LucideUnlock className="mr-2" />
                            Unblock
                          </button>
                        ) : (
                          <button
                            className="btn bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-yellow-600 transition-colors"
                            onClick={() =>
                              handleBlockUser(user.id, courseCode)
                            }
                          >
                            <LucideBan className="mr-2" />
                            Block
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
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