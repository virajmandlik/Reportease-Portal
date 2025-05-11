import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import "./style/FileUpload.css";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:3000/api/upload", formData);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/download", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "exported_data.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const handleFileUpdate = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:3000/api/update", formData);
      alert("File updated successfully!");
    } catch (error) {
      console.error("Error updating file:", error);
    }
  };

  return (
    <div className="file-upload card p-4 shadow-sm">
      <div className="mb-3">
        <label className="form-label">Choose Excel File</label>
        <input
          type="file"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>
      <div className="d-flex justify-content-between mt-3 flex-wrap">
        <button
          className="btn btn-primary btn-animated"
          onClick={handleFileUpload}
          disabled={!file}
        >
          Upload Excel
        </button>
        <button
          className="btn btn-warning btn-animated"
          onClick={handleFileUpdate}
        >
          Update Excel
        </button>
        <button
          className="btn btn-success btn-animated"
          onClick={handleDownload}
        >
          Download Excel
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
