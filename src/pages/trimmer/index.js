import { useState } from 'react';
import { FaCloudUploadAlt, FaDownload, FaDownloadAll } from 'react-icons/fa';
import Image from 'next/image';
import '@/styles/globals.css';
import Loading from '@/components/loading';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [message, setMessage] = useState("");
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagesProcessed, setImagesProcessed] = useState(0); // New state for tracking processed images
  const [totalImages, setTotalImages] = useState(0); // New state for total images

  const [cropDetails, setCropDetails] = useState({
    top: '',
    bottom: '',
    left: '',
    right: ''
  });

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setThumbnails(files.map(file => URL.createObjectURL(file)));
    setTotalImages(files.length); // Set total images
    setImagesProcessed(0); // Reset processed images
  };

  const handleCropChange = (e) => {
    const { name, value } = e.target;
    setCropDetails(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));
    formData.append('top', cropDetails.top);
    formData.append('bottom', cropDetails.bottom);
    formData.append('left', cropDetails.left);
    formData.append('right', cropDetails.right);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message);
      setDownloadLinks(data.downloadLinks || []);

      // Update processed images count
      setImagesProcessed(selectedFiles.length);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {loading && <Loading imagesProcessed={imagesProcessed} totalImages={totalImages} />}

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-2xl text-black font-bold text-center mb-4">Upload and Crop Images</h2>

        {/* Instructions */}
        <p className="text-black font-bold mb-4">
          1. Select multiple images to upload.<br />
          2. Enter crop values for top, bottom, left, and right (in pixels).<br />
          3. After submission, you will receive download links for the cropped images.<br />
          4. Click Download All to download all cropped images at once.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            className="w-full px-4 py-2 border text-black border-gray-300 rounded-md"
          />

          <div className="grid grid-cols-4 gap-4">
            <input
              type="number"
              placeholder="Top Crop (px)"
              name="top"
              value={cropDetails.top}
              onChange={handleCropChange}
              className="px-4 py-2 border border-gray-300 text-black rounded-md"
            />
            <input
              type="number"
              placeholder="Bottom Crop (px)"
              name="bottom"
              value={cropDetails.bottom}
              onChange={handleCropChange}
              className="px-4 py-2 border border-gray-300 text-black rounded-md"
            />
            <input
              type="number"
              placeholder="Left Crop (px)"
              name="left"
              value={cropDetails.left}
              onChange={handleCropChange}
              className="px-4 py-2 border border-gray-300 text-black rounded-md"
            />
            <input
              type="number"
              placeholder="Right Crop (px)"
              name="right"
              value={cropDetails.right}
              onChange={handleCropChange}
              className="px-4 py-2 border border-gray-300 text-black rounded-md"
            />
          </div>

          {thumbnails.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {thumbnails.map((thumbnail, index) => (
                <Image
                  key={index}
                  src={thumbnail}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="object-cover"
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 justify-center mt-4"
          >
            <FaCloudUploadAlt className="h-5 w-5" />
            Upload and Crop Images
          </button>
        </form>

        {message && <p className="text-red-600 mt-4">{message}</p>}
      </div>

      {downloadLinks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl text-center mt-6">
          <p className="text-green-600 mb-4">Your images are ready for download!</p>
          <ul className="flex flex-col gap-2">
            {downloadLinks.map((link, index) => (
              <li key={index}>
                <a
                  href={link.url}
                  download={link.name}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 justify-center"
                >
                  <FaDownload className="h-5 w-5" />
                  Download {link.name}
                </a>
              </li>
            ))}
          </ul>
          <button
            onClick={handleDownloadAll}
            className="bg-green-600 text-white px-4 py-2 mt-4 tezxt-black rounded-md flex items-center gap-2 hover:bg-green-700 justify-center"
          >
            <FaDownload className="h-5 w-5" />
            Download All
          </button>
        </div>
      )}
    </div>
  );
}
