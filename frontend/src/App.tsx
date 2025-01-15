import React, { useState, useEffect } from "react";
import axios from "axios";

interface Image {
  _id: string;
  filePath: string;
  fileName: string;
}

const App: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Images
  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:5000/images");
      setImages(response.data);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError("Failed to fetch images");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const fileType = file.type;
      const validTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!validTypes.includes(fileType)) {
        alert("Please select a valid image file (JPG, JPEG, PNG).");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  // Handle File Upload
  const handleUpload = async () => {
    if (!selectedFile) return alert("Please select a file to upload.");
    const formData = new FormData();
    formData.append("image", selectedFile);

    setLoading(true);
    setError(null);

    try {
      await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedFile(null);
      fetchImages(); // Refresh image list
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Failed to upload file");
    }
    setLoading(false);
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`http://localhost:5000/images/${id}`);
      fetchImages(); // Refresh image list
    } catch (err) {
      console.error("Error deleting file:", err);
      setError("Failed to delete file");
    }
    setLoading(false);
  };

  return (
    <div className="bg-purple-800 min-h-screen text-white flex flex-col items-center pt-12">
      <h1 className="text-5xl font-bold mb-8">MongoDB Testing</h1>

      {/* Error Message */}
      {error && <div className="bg-red-600 text-white p-4 rounded mb-6">{error}</div>}

      {/* File Upload Section */}
      <div className="flex flex-col items-center space-y-4 mb-8">
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input text-white border-2 border-purple-400 rounded px-4 py-2 focus:outline-none"
        />
        <button
          onClick={handleUpload}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 neon-effect transition-all"
        >
          Upload
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-6"></div>
      )}

      {/* File Name List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full px-6">
        {images.map((image) => (
          <div
            key={image._id}
            className="bg-purple-900 p-4 rounded shadow-lg flex flex-col items-center space-y-4"
          >
            <span className="text-white font-medium">{image.fileName}</span>
            <div className="flex space-x-4">
              <button
                onClick={() => window.open(`http://localhost:5000${image.filePath}`, "_blank")}
                className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 neon-effect transition-all"
              >
                View
              </button>
              <button
                onClick={() => handleDelete(image._id)}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 neon-effect transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
