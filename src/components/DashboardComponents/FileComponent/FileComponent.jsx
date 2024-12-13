import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import CodeEditor from "./CodeEditor";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const FileComponent = () => {
  const { fileId } = useParams();
  // const downloadFile = () => {
  //   const element = document.createElement("a");
  //   element.setAttribute("href", currentFile.data.url);
  //   element.setAttribute("download", currentFile.data.name);
  //   element.setAttribute("target", "_blank");
  //   element.style.display = "none";
  //   document.body.appendChild(element);

  //   element.click();
  //   document.body.removeChild(element);
  // };
  const [fileData, setFileData] = useState("");
  const navigate = useNavigate();
  const { user } = useSelector(
    (state) => ({
      user: state.auth.user,
    }),
    shallowEqual
  );
  const userUID = user.uid;
  const isDownloadAllowed =
    userUID === "3iEuFfnyXAXCvpcICqVl7QswgmA3" ||
    userUID === "CXjw9gHacUZoLBbZeuUZQv3Jdv83";
  const [prevFileData, setPrevFileData] = useState("");
  const { currentFile, isAuthenticated } = useSelector(
    (state) => ({
      currentFile: state.fileFolders.userFiles.find(
        (file) => file.docId === fileId
      ),
      isAuthenticated: state.auth.isAuthenticated,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  });
  useEffect(() => {
    if (currentFile) {
      setFileData(currentFile?.data?.data);
      setPrevFileData(currentFile?.data?.data);
    }
  }, [currentFile, currentFile?.data?.data]);

  if (isAuthenticated)
    return (
      <div>
        {isAuthenticated && fileData !== null ? (
          <>
            <Header
              fileName={currentFile?.data?.name}
              fileData={fileData}
              prevFileData={prevFileData}
              fileId={fileId}
            />
            <CodeEditor
              fileName={currentFile?.data?.name}
              data={fileData}
              setData={setFileData}
            />
          </>
        ) : (
          <div className="position-fixed left-0 top-0 w-100 h-100 bg-black text-white">
            <div className="d-flex py-4 mt-4 px-5 justify-content-between align-items-center">
              <p className="my-0" title={currentFile?.data?.name}>
                {currentFile?.data?.name.length > 40
                  ? currentFile?.data?.name.slice(0, 40) +
                    "... ." +
                    currentFile?.data?.extension
                  : currentFile?.data?.name}
              </p>
              <div className="d-flex align-items-center me-5">
                <button
                  className="btn btn-sm btn-outline-light mr-2"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </button>
                {/* <button
                className="btn btn-sm btn-primary ms-2"
                onClick={() => downloadFile()}
              >
                Download
              </button> */}
              </div>
            </div>
            <div
              style={{
                width: "100vw",
                height: "80vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div className="mt-4" style={{ height: "auto", width: "500px" }}>
                {currentFile?.data?.extension === "mp4" ? (
                  <video
                    controls
                    controlsList={isDownloadAllowed ? "" : "nodownload"}
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    style={{ width: "100%", height: "auto" }}
                  >
                    <source src={currentFile?.data?.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : currentFile?.data?.extension === "pdf" ? (
                  <div className="pdf-container">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                      {
                        <>
                          <div
                            style={{
                              border: "1px solid rgba(0, 0, 0, 0.3)",
                              height: "600px",
                            }}
                          >
                            <Viewer fileUrl={currentFile?.data?.url} />
                          </div>
                        </>
                      }
                    </Worker>
                  </div>
                ) : currentFile?.data?.extension.includes("png") ||
                  currentFile?.data?.extension.includes("jpg") ||
                  currentFile?.data?.extension.includes("jpeg") ||
                  currentFile?.data?.extension.includes("gif") ? (
                  <TransformWrapper
                    defaultScale={1}
                    defaultPositionX={100}
                    defaultPositionY={200}
                  >
                    <TransformComponent>
                      <img
                        src={currentFile?.data?.url}
                        alt={currentFile?.data?.name}
                        className="w-100 h-100 img-fluid"
                        onContextMenu={(e) => e.preventDefault()}
                      />
                    </TransformComponent>
                  </TransformWrapper>
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <p className="text-center">File Type Not Supported!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );

  return <div>Login First</div>;
};

export default FileComponent;
