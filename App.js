import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, X, Copy, Loader2, Check, XCircle, Moon, Sun } from "lucide-react";

function App() {
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [fileType, setFileType] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [isHashing, setIsHashing] = useState(false);
  const [verifyHash, setVerifyHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage first, then system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [showStamp, setShowStamp] = useState(false);
  const [stampType, setStampType] = useState('success'); // 'success' or 'error'

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const generateHash = async (file) => {
    setIsHashing(true);
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } finally {
      setIsHashing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fileHash);
      alert('Hash copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      handleFilePreview(file);
      generateHash(file).then(hash => setFileHash(hash));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation
    setIsDragging(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      handleFilePreview(file);
      const hash = await generateHash(file);
      setFileHash(hash);
    }
  };

  const handleFilePreview = (file) => {
    const fileType = file.type;
    setFileType(fileType);

    if (fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const verifyFileHash = () => {
    if (!fileHash || !verifyHash) return;
    
    const isMatch = fileHash.toLowerCase() === verifyHash.toLowerCase().trim();
    setVerificationResult(isMatch);
    
    setStampType(isMatch ? 'success' : 'error');
    setShowStamp(true);
    setTimeout(() => setShowStamp(false), 3000);
  };

  const clearVerification = () => {
    setVerifyHash("");
    setVerificationResult(null);
  };

  const clearFile = () => {
    setFileName("");
    setFilePreview(null);
    setFileType("");
    setFileHash("");
    setIsHashing(false);
    clearVerification();
  };

  const StampAnimation = () => (
    <AnimatePresence>
      {showStamp && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          {/* Hand */}
          <motion.div
            initial={{ y: -100, rotate: -15 }}
            animate={{ y: 0, rotate: 0 }}
            transition={{ 
              duration: 0.5,
              delay: 0.2,
              type: "spring",
              stiffness: 200,
              damping: 10
            }}
            className="absolute -top-20"
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-700 dark:text-gray-300"
            >
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8v0a8 8 0 0 1-8-8v-2" />
              <path d="M18 8v3" />
            </svg>
          </motion.div>

          {/* Stamp */}
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              duration: 0.3,
              delay: 0.1,
              type: "spring",
              stiffness: 300,
              damping: 15
            }}
            className="relative"
          >
            <div className={`w-32 h-32 ${stampType === 'success' ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center shadow-lg`}>
              <div className={`absolute inset-0 ${stampType === 'success' ? 'bg-green-600' : 'bg-red-600'} rounded-full opacity-50 blur-sm`}></div>
              <span className="text-white font-bold text-5xl">
                {stampType === 'success' ? '✓' : '✗'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col items-center justify-center px-4 relative overflow-hidden transition-colors duration-200"
      onDragOver={(e) => e.preventDefault()} // Prevent default drag behavior on the entire page
      onDrop={(e) => e.preventDefault()} // Prevent default drop behavior on the entire page
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5 transition-opacity duration-200">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAzNGM0LjQxOCAwIDgtMy41ODIgOC04cy0zLjU4Mi04LTgtOC04IDMuNTgyLTggOCAzLjU4MiA4IDggOHoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIi8+PC9nPjwvc3ZnPg==')]"></div>
      </div>

      {/* Reflecting light effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-100/20 to-transparent dark:from-blue-400/10 dark:to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-t from-purple-100/20 to-transparent dark:from-purple-400/10 dark:to-transparent"></div>
      </div>

      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="fixed top-4 right-4 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 shadow-lg"
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun size={20} className="text-yellow-400" />
        ) : (
          <Moon size={20} className="text-gray-600" />
        )}
      </button>
      
      {/* Stamp Animation */}
      <StampAnimation />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-lg text-center transition-all relative z-10 transition-colors duration-200"
      >
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2 py-1"
        >
          VeryFixation
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-500 dark:text-gray-400 mb-6"
        >
          Where Elegance Meets Verification
        </motion.p>

        {!filePreview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed p-6 rounded-xl transition-all relative ${
              isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
            }`}
          >
            <FileUp className="mx-auto text-blue-500 dark:text-blue-400" size={48} />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Drag & drop or click to upload</p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <button
              onClick={clearFile}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
            
            {fileType.startsWith('image/') ? (
              <img
                src={filePreview}
                alt="Preview"
                className="max-h-64 w-full object-contain rounded-lg shadow-md"
              />
            ) : fileType === 'application/pdf' ? (
              <iframe
                src={filePreview}
                className="w-full h-64 rounded-lg shadow-md"
                title="PDF Preview"
              />
            ) : (
              <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">Preview not available for this file type</p>
              </div>
            )}
          </motion.div>
        )}

        {fileName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4"
          >
            <p className="text-green-600 dark:text-green-400 font-medium mb-2">
              Selected File: <span className="font-bold">{fileName}</span>
            </p>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mt-2">
              {isHashing ? (
                <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Loader2 className="animate-spin" size={16} />
                  <span className="text-sm">Hashing file...</span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-mono break-all">
                    SHA256: {fileHash}
                  </p>
                  <button
                    onClick={copyToClipboard}
                    className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                    title="Copy hash"
                  >
                    <Copy size={16} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Verification Section */}
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={verifyHash}
                  onChange={(e) => setVerifyHash(e.target.value)}
                  placeholder="Enter hash to verify"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={verifyFileHash}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Verify
                </button>
              </div>

              {verificationResult !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 p-2 rounded-lg flex items-center justify-center space-x-2 ${
                    verificationResult 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {verificationResult ? (
                    <>
                      <Check size={16} />
                      <span>Hash matches!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      <span>Hash does not match</span>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      <footer className="absolute bottom-0 left-0 right-0 h-8 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 flex items-center px-4 transition-colors duration-200">
        <p className="text-xs text-gray-600 dark:text-gray-400">SEC Project - Yuvika Agrawal</p>
      </footer>
    </div>
  );
}

export default App;
