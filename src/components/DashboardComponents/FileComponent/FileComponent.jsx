import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import { shallowEqual, useSelector } from "react-redux";
import CodeEditor from "./CodeEditor";
import { useEffect, useState } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  LucideArrowLeft,
  LucideImage,
  LucideFilm,
  LucideFileText,
  FileText,
} from "lucide-react";

const FileComponent = () => {
  const { fileId } = useParams();
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
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (currentFile) {
      setFileData(currentFile?.data?.data);
      setPrevFileData(currentFile?.data?.data);
    }
  }, [currentFile, currentFile?.data?.data]);

  // Render file name with truncation
  const renderFileName = () => {
    const name = currentFile?.data?.name || "";
    const extension = currentFile?.data?.extension || "";

    return name.length > 40
      ? `${name.slice(0, 40)}...${extension ? "." + extension : ""}`
      : `${name}${extension ? "." + extension : ""}`;
  };

  // Render file content based on extension
  const renderFileContent = () => {
    const fileUrl = currentFile?.data?.url;
    const fileExtension = currentFile?.data?.extension?.toLowerCase();

    if (!fileUrl)
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <LucideFileText className="w-12 h-12 mr-2" />
          <p>No file content available</p>
        </div>
      );

    switch (true) {
      case fileExtension === "mp4":
        return (
          <video
            controls
            controlsList={isDownloadAllowed ? undefined : "nodownload"}
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="max-w-full max-h-[70vh] mx-auto"
          >
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );

      case fileExtension === "pdf":
        return (
          <div className="w-full max-h-[70vh] overflow-auto">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <div className="border border-gray-300 rounded-lg">
                <Viewer fileUrl={fileUrl} />
              </div>
            </Worker>
          </div>
        );

      case ["png", "jpg", "jpeg", "gif"].includes(fileExtension):
        return (
          <TransformWrapper
            defaultScale={1}
            defaultPositionX={100}
            defaultPositionY={200}
          >
            <TransformComponent>
              <img
                src={fileUrl}
                alt={currentFile?.data?.name}
                className="max-w-full max-h-[70vh] mx-auto object-contain"
                onContextMenu={(e) => e.preventDefault()}
              />
            </TransformComponent>
          </TransformWrapper>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <LucideFileText className="w-12 h-12 mb-4" />
            <p>File Type Not Supported!</p>
          </div>
        );
    }
  };

  const renderFileTypeIcon = () => {
    const fileExtension = currentFile?.data?.extension?.toLowerCase();

    switch (true) {
      case fileExtension === "mp4":
        return <LucideFilm className="w-6 h-6 mr-2 text-blue-500" />;
      case fileExtension === "pdf":
        return <FileText className="w-6 h-6 mr-2 text-red-500" />;
      case ["png", "jpg", "jpeg", "gif"].includes(fileExtension):
        return <LucideImage className="w-6 h-6 mr-2 text-green-500" />;
      default:
        return <LucideFileText className="w-6 h-6 mr-2 text-gray-500" />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-2xl text-gray-700">Please Login</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {fileData !== null ? (
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
        <div className="bg-black text-white">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                {renderFileTypeIcon()}
                <p
                  className="text-lg font-medium truncate max-w-xs"
                  title={currentFile?.data?.name}
                >
                  {renderFileName()}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="btn flex items-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <LucideArrowLeft className="w-5 h-5 mr-2" />
                  Go Back
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center min-h-[70vh] p-4">
              <div className="w-full max-w-4xl">{renderFileContent()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileComponent;
