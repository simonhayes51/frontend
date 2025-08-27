// src/pages/AccessDenied.jsx
import React from "react";

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-white text-gray-900 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 dark:text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <img
              src="/server-logo.png"
              alt="Server Logo"
              className="w-12 h-12 rounded-full"
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="white" d="M12 2L13.09 8.26L22 9L13.09 15.74L12 22L10.91 15.74L2 9L10.91 8.26L12 2Z"/></svg>';
              }}
            />
          </div>
          <h1 className="text-2xl font-bold">FUT Trading Dashboard</h1>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-200 dark:border-gray-700/50">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/15 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
