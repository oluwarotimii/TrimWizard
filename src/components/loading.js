"use client";

import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import '../styles/globals.css';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
      <div className="text-white text-center">
        <FaSpinner className="animate-spin text-4xl mb-4" />
        <p className="text-lg">Processing your images...</p>
      </div>
    </div>
  );
};

export default Loading;
