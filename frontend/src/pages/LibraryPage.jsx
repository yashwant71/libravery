// frontend/src/pages/LibraryPage.jsx
import { useOutletContext } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";

function LibraryPage() {
  const {
    library,
    loading,
    error,
    refreshKey,
    handleFileUploadSuccess,
    userInfo,
  } = useOutletContext();

  if (loading) {
    return (
      <div className="p-5">
        <div className="h-8 w-1/2 bg-background-muted rounded animate-pulse mb-8"></div>
        <div className="h-32 bg-background-muted rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (error || !library) {
    return (
      <div className="p-5 text-danger text-center">
        {error || "Library could not be loaded."}
      </div>
    );
  }

  return (
    <div className="p-5">
      <p className="text-text-muted mb-8">{library.description}</p>
      <FileUpload
        libraryId={library._id}
        onFileUploaded={handleFileUploadSuccess}
        user={userInfo}
      />
      <h3 className="text-2xl font-semibold mt-10 mb-4">
        Files in this Library
      </h3>
      <FileList libraryName={library.name} refreshTrigger={refreshKey} />
    </div>
  );
}

export default LibraryPage;
