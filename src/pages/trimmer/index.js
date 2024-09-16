import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { FaCloudUploadAlt } from "react-icons/fa";
import '@/styles/globals.css';
import Loading from '@/components/loading';
import getCroppedImg from '@/utils/cropImage'; // Utility function to extract cropped image

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState(null); // For download link
  const [showDownloadButton, setShowDownloadButton] = useState(false); // Manage visibility

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels); 
  }, []);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result); 
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedFiles.length || !croppedAreaPixels) return;

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('files', file));
    formData.append('cropWidth', croppedAreaPixels.width);
    formData.append('cropHeight', croppedAreaPixels.height);
    formData.append('x', croppedAreaPixels.x);
    formData.append('y', croppedAreaPixels.y);

    try {
      setLoading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.downloadLink) {
        setDownloadLink(data.downloadLink); // Set download link on success
        setShowDownloadButton(true); // Show download button
      }
      console.log(data.message);
    } catch (error) {
      console.error("Upload error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {loading && <Loading />}

      <div className={`bg-white p-6 rounded-lg shadow-md w-full max-w-3xl ${showDownloadButton ? 'hidden' : ''}`}>
        <h2 className="text-2xl font-bold text-center mb-4">Upload and Crop Images</h2>

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="w-full mb-4 p-2 border border-gray-300 rounded-md"
        />

        {imageSrc && (
          <div className="relative w-full h-96 bg-gray-200">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
        )}

        {selectedFiles.length > 0 && !showDownloadButton && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-green-700"
              disabled={loading}
            >
              <FaCloudUploadAlt className="h-5 w-5" />
              Upload Cropped Images
            </button>
          </div>
        )}
      </div>

      {showDownloadButton && (
        <div className="flex justify-center mt-4">
          <a
            href={downloadLink}
            download
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Download Cropped Images
          </a>
        </div>
      )}
    </div>
  );
}
