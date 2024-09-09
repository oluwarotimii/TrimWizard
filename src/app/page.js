"use client";

import { useState } from 'react';
import '@/styles/globals.css';
import Image from 'next/image';
import Loading from '@/components/loading';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [thumbnails, setThumbnails] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) return;

    setLoading(true);

    const formData = new FormData();
    const files = event.target.elements[0].files;

    if (files) {
      Array.from(files).forEach(file => formData.append('files', file));
    } else {
      console.error('No files selected');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message);
      if (data.downloadLink) {
        setDownloadLink(data.downloadLink);
        // Generate thumbnails for cropped images
        const response = await fetch(data.downloadLink);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.src = url;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = 100; // Thumbnail width
          canvas.height = (img.height / img.width) * 100; // Thumbnail height
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const thumbnailUrl = canvas.toDataURL();
          setThumbnails([thumbnailUrl]); // Set thumbnails array
        };
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-50">
      {loading && <Loading />}

      {/* Image Preview Section */}
      <div className="w-full md:w-1/2 p-4 flex flex-wrap gap-4">
        {selectedFiles.length > 0 ? (
          selectedFiles.map((file, index) => (
            <img
              key={index}
              src={file}
              alt={`Selected Preview ${index + 1}`}
              className="object-cover w-32 h-32 md:w-48 md:h-48 rounded-lg shadow-lg"
            />
          ))
        ) : (
          <div className="flex items-center justify-center w-full h-64 md:h-auto border border-gray-300 rounded-lg shadow-md">
            <p className="text-gray-500">No images selected</p>
          </div>
        )}
      </div>

      {/* Cropped Images and Download Section */}
      <div className="w-full md:w-1/2 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-center mb-6">Image Upload and Crop</h1>

          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
            <input
              type="file"
              onChange={handleFileChange}
              multiple
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out"
            >
              Upload
            </button>
          </form>

          {message && <p className="mt-4 text-green-500 text-center">{message}</p>}

          {/* Cropped Images Thumbnails Section */}
          {thumbnails.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-center mb-4">Cropped Images</h2>
              <div className="flex flex-wrap gap-4 justify-center">
                {thumbnails.map((thumb, index) => (
                  <img
                    key={index}
                    src={thumb}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-gray-300 shadow-md"
                  />
                ))}
              </div>
              <div className="mt-4 text-center">
                <a
                  href={downloadLink}
                  download
                  className="text-blue-500 hover:underline"
                >
                  Download All Cropped Images
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
