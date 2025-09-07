// frontend/src/pages/LibraryPage.jsx
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import FileUpload from "../components/FileUpload";
import FileList from "../components/FileList";
import FilterControls from "../components/FilterControls";

function LibraryPage() {
  const {
    library,
    loading,
    error,
    refreshKey,
    handleFileUploadSuccess,
    userInfo,
  } = useOutletContext();
  const [currentFilter, setCurrentFilter] = useState("most-recent");

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
      {/* --- NEW: Responsive Flexbox Container --- */}
      {/* On mobile (default): flex-col, items-start (left-aligned) */}
      {/* On medium screens and up (md:): flex-row, items-center, justify-between */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        {/* Left Side: Description */}
        <div className="flex-1">
          <p className="text-text-muted">
            {library.description || "No description for this library."}
          </p>
        </div>

        {/* Right Side: Upload Button */}
        <div className="flex-shrink-0">
          <FileUpload
            libraryId={library._id}
            onFileUploaded={handleFileUploadSuccess}
            user={userInfo}
          />
        </div>
      </div>

      <div className="border-t border-border pt-6 mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h3 className="text-2xl font-semibold">Contributions</h3>
        <FilterControls
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
        />
      </div>
      <FileList
        libraryName={library.name}
        refreshTrigger={refreshKey}
        filter={currentFilter}
      />
    </div>
  );
}

export default LibraryPage;
