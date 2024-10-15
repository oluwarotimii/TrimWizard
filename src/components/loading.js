"use client";

import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import '../styles/globals.css';

const Loading = ({ imagesProcessed, totalImages }) => {
  const progressPercentage = totalImages ? (imagesProcessed / totalImages) * 100 : 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="text-white text-center">
        <FaSpinner className="animate-spin text-4xl mb-4" />
        <p className="text-lg">Processing your images...</p>
        <div className="w-full bg-gray-300 rounded-full mt-4">
          {/* <div
            className="bg-green-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
            style={{ width: `${progressPercentage}%` }}
          >
            {imagesProcessed} / {totalImages}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Loading;
