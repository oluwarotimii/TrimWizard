import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { FaCloudUploadAlt, FaDownload } from "react-icons/fa";
import Image from "next/image";
import '@/styles/globals.css';
import Loading from '@/components/loading';
import getCroppedImg from '@/utils/cropImage'; // Utility function to extract cropped image
import CropShower from "@/components/sample";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImageSrc(reader.result);
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  const handleCrop = async () => {
    try {
      setLoading(true);
      const croppedImageData = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(croppedImageData);
      setLoading(false);
    } catch (error) {
      console.error("Error cropping the image: ", error);
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!croppedImage) return;

    const formData = new FormData();
    formData.append('file', croppedImage);

    try {
      setLoading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
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
      <CropShower />
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-4">Upload and Crop Image</h2>

        <input
          type="file"
          accept="image/*"
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

        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleCrop}
            className="bg-indigo-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-indigo-700"
            disabled={!imageSrc || loading}
          >
            Crop Image
          </button>

          {croppedImage && (
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-green-700"
              disabled={loading}
            >
              <FaCloudUploadAlt className="h-5 w-5" />
              Upload Cropped Image
            </button>
          )}
        </div>

        {croppedImage && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Cropped Image Preview:</h3>
            <img src={croppedImage} alt="Cropped Preview" className="rounded-md shadow-md" />
          </div>
        )}
      </div>
    </div>
  );
}
