import { useState } from 'react';
import { FaCloudUploadAlt, FaDownload } from 'react-icons/fa';
import Image from 'next/image';
import '@/styles/globals.css'

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [message, setMessage] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    setThumbnails(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) return;

    setLoading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));

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
      {loading && <div className="text-center text-gray-700">Loading...</div>}

      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-center mb-4">Upload and Crop Images</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
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

        {/* Display image previews */}
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

        {/* Display download button */}
        {downloadLink && (
          <div className="mt-6 text-center">
            <a
              href={downloadLink}
              download
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700"
            >
              <FaDownload className="h-5 w-5" />
              Download Cropped Images
            </a>
          </div>
        )}
      </div>
    </div>
  );
}