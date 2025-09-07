// frontend/src/components/ImageEditorModal.jsx
import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { FaTimes, FaCheck, FaCropAlt, FaTrashRestore } from "react-icons/fa";

// This helper function is unchanged from your version
function getCroppedImage(image, crop) {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context.");
  }

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return canvas.toDataURL("image/jpeg", 0.9);
}

// The toolbar is unchanged from your version
function EditorToolbar({
  mode,
  onFinalSave,
  onCancelAction,
  onCropClick,
  onConfirmCrop,
  onClose,
}) {
  return (
    <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-4 flex justify-between items-center z-10">
      <button
        onClick={mode === "main" ? onClose : onCancelAction}
        className="p-2 text-white text-xl hover:text-gray-300 transition-colors"
      >
        <FaTimes />
      </button>

      {mode === "main" && (
        <div className="flex gap-6">
          <button
            onClick={onCropClick}
            className="p-2 text-white text-xl hover:text-green-400"
            title="Crop Image"
          >
            <FaCropAlt />
          </button>
        </div>
      )}

      <div>
        {mode === "main" ? (
          <button
            onClick={onFinalSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Save
          </button>
        ) : (
          <button
            onClick={onConfirmCrop}
            className="p-2 text-white text-2xl hover:text-green-400"
            title="Confirm Crop"
          >
            <FaCheck />
          </button>
        )}
      </div>
    </div>
  );
}

EditorToolbar.propTypes = {
  mode: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onCropClick: PropTypes.func.isRequired,
  onFinalSave: PropTypes.func.isRequired,
  onConfirmCrop: PropTypes.func.isRequired,
  onCancelAction: PropTypes.func.isRequired,
};

function ImageEditorModal({ file, onSave, onClose }) {
  const [imgSrc, setImgSrc] = useState("");
  const [editorMode, setEditorMode] = useState("main");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [description, setDescription] = useState(""); // <-- NEW: State for description
  const imgRef = useRef(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(file);
    }
  }, [file]);

  const handleFinalSave = () => {
    if (!imgRef.current) return;

    let finalDataUrl = imgSrc; // Default to the original/current image source

    if (completedCrop && completedCrop.width > 0) {
      finalDataUrl = getCroppedImage(imgRef.current, completedCrop);
    }

    // --- MODIFIED: Pass the description along with the image data ---
    onSave(finalDataUrl, description);
  };

  const enterCropMode = () => {
    if (imgRef.current) {
      const defaultCrop =
        completedCrop ||
        centerCrop(
          makeAspectCrop(
            { unit: "%", width: 90 },
            undefined, // Freeform aspect ratio
            imgRef.current.width,
            imgRef.current.height
          ),
          imgRef.current.width,
          imgRef.current.height
        );
      setCrop(defaultCrop);
      setEditorMode("crop");
    }
  };

  const handleConfirmCrop = () => {
    if (crop && crop.width > 0) {
      const croppedDataUrl = getCroppedImage(imgRef.current, crop);
      setImgSrc(croppedDataUrl); // Apply the crop to the main image source
      setCompletedCrop(null); // Reset completed crop as it's now part of the base image
      setCrop(undefined); // Hide the crop UI
    }
    setEditorMode("main");
  };

  const handleCancelAction = () => {
    setEditorMode("main");
    setCrop(undefined);
  };

  const resetCrop = () => {
    setCompletedCrop(null);
    // You might want to reload the original image source if you reset
    // This part is optional, depending on desired UX
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || "")
      );
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-40 flex flex-col justify-center items-center">
      <style>
        {`
          .ReactCrop__image { touch-action: none; }
          .ReactCrop__drag-handle { width: 20px; height: 20px; margin-top: -10px; margin-left: -10px; }
        `}
      </style>

      <EditorToolbar
        mode={editorMode}
        onClose={onClose}
        onCropClick={enterCropMode}
        onFinalSave={handleFinalSave}
        onConfirmCrop={handleConfirmCrop}
        onCancelAction={handleCancelAction}
      />

      <div className="relative w-full h-full flex items-center justify-center p-4">
        {imgSrc && (
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop) => setCrop(pixelCrop)}
            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
            disabled={editorMode !== "crop"}
            ruleOfThirds={editorMode === "crop"}
          >
            <img
              ref={imgRef}
              src={imgSrc}
              className="max-h-[80vh] max-w-[95vw] object-contain"
              alt="Image to Crop"
            />
          </ReactCrop>
        )}
      </div>

      {/* --- NEW: Description input appears in main mode --- */}
      {editorMode === "main" && (
        <div className="absolute bottom-4 w-full max-w-xl px-4 z-10">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            className="w-full bg-black bg-opacity-50 border border-gray-600 text-white rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {editorMode === "main" && completedCrop && (
        <div className="absolute bottom-4 left-4 z-10">
          <button
            onClick={resetCrop}
            className="flex items-center gap-2 bg-black bg-opacity-60 text-white py-2 px-3 rounded-full text-sm hover:bg-opacity-80 transition-colors"
          >
            <FaTrashRestore />
            Reset Crop
          </button>
        </div>
      )}
    </div>
  );
}

ImageEditorModal.propTypes = {
  file: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ImageEditorModal;
