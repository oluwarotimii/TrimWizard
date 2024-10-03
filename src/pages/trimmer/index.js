import { useState } from 'react';
import { FaCloudUploadAlt, FaDownload } from 'react-icons/fa';
import Image from 'next/image';
import '@/styles/globals.css';
import Loading from '@/components/loading';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [message, setMessage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Cropping parameters state
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
      setDownloadLink(data.downloadLink);
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {loading && <Loading />}

      {downloadLink ? (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl text-center">
          <p className="text-green-600 mb-4">Your images are ready for download!</p>
          <a
            href={downloadLink}
            download
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 justify-center"
          >
            <FaDownload className="h-5 w-5" />
            Download Cropped Images
          </a>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-4">Upload and Crop Images</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />

            {/* Cropping Input Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700">Top (px)</label>
                <input
                  type="number"
                  name="top"
                  value={cropDetails.top}
                  onChange={handleCropChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-gray-700">Bottom (px)</label>
                <input
                  type="number"
                  name="bottom"
                  value={cropDetails.bottom}
                  onChange={handleCropChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <label className="block text-gray-700">Left (px)</label>
                <input
                  type="number"
                  name="left"
                  value={cropDetails.left}
                  onChange={handleCropChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="300"
                />
              </div>
              <div>
                <label className="block text-gray-700">Right (px)</label>
                <input
                  type="number"
                  name="right"
                  value={cropDetails.right}
                  onChange={handleCropChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  min="0"
                  max="300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-indigo-600 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-indigo-700"
            >
              <FaCloudUploadAlt className="h-5 w-5" />
              Upload and Crop
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-green-600">{message}</p>
          )}

          <div className="mt-6">
            {thumbnails.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-center">
                {thumbnails.map((thumb, index) => (
                  <div key={index} className="w-32 h-32 relative">
                    <Image src={thumb} alt={`Preview ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md shadow-md" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No images selected</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
