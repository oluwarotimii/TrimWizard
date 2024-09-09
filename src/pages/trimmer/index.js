"use client";

import { useState } from 'react';
import '@/styles/globals.css';

export default function Home() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files.map(file => URL.createObjectURL(file)));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (selectedFiles.length === 0) return;

    const formData = new FormData();
    Array.from(event.target.files).forEach(file => formData.append('files', file));

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-50">
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

      {/* Upload Form Section */}
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
        </div>
      </div>
    </div>
  );
}
