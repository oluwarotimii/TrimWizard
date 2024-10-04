// src/pages/auth/index.js
import { useState } from 'react';
import '@/styles/globals.css';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');  // Reset message on submit

    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Email added successfully!');
      } else {
        setMessage(`Error: ${data.error || 'Failed to add email.'}`);
      }
    } catch (error) {
      console.error('Request failed:', error);
      setMessage('Network error. Please try again later.');
    } finally {
      setLoading(false);  // Stop loading after request is done
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800">Login with Email</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />

          <button
            type="submit"
            className={`w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              loading ? 'cursor-not-allowed opacity-50' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>

        {message && (
          <p className={`text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </p>
        )}

        {loading && (
          <div className="flex justify-center">
            <svg
              className="w-6 h-6 animate-spin text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="4" />
              <path d="M12 6v6h6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
