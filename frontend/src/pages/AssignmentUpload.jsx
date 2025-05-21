import React, { useState, useEffect, useRef } from "react";
import { FaUpload, FaFileAlt, FaDownload, FaShareAlt, FaEye, FaFilePdf, FaFileImage, FaFile, FaFileWord, FaFileExcel, FaFilePowerpoint } from "react-icons/fa";
import "./assignmentUpload.css";

const AssignmentUpload = () => {
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load previous assignments from localStorage when the component mounts
  useEffect(() => {
    const savedAssignments = JSON.parse(localStorage.getItem("assignments")) || [];
    
    // Recreate object URLs for files that were previously stored
    const updatedAssignments = savedAssignments.map(assignment => {
      // If the assignment has stored file data, recreate the object URL
      if (assignment.fileData) {
        const blob = dataURItoBlob(assignment.fileData);
        return {
          ...assignment,
          fileURL: URL.createObjectURL(blob)
        };
      }
      return assignment;
    });
    
    setAssignments(updatedAssignments);
  }, []);

  // Convert data URI to Blob
  const dataURItoBlob = (dataURI) => {
    // Split the data URI to get the base64 data
    const parts = dataURI.split(',');
    const byteString = atob(parts[1]);
    
    // Get MIME type from the data URI
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    
    // Convert base64 to Blob
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mime });
  };

  // Convert file to data URI
  const fileToDataURI = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  // Handle file change
  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
    }
  };

  // Handle file upload area click
  const handleUploadAreaClick = () => {
    fileInputRef.current.click();
  };

  // Get file icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image")) return <FaFileImage />;
    if (fileType === "application/pdf") return <FaFilePdf />;
    if (fileType.includes("word")) return <FaFileWord />;
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return <FaFileExcel />;
    if (fileType.includes("presentation") || fileType.includes("powerpoint")) return <FaFilePowerpoint />;
    return <FaFile />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    // Check file size (5MB limit for localStorage)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large. Please select a file smaller than 5MB.");
      return;
    }

    try {
      setUploading(true);
      
      // Simulate network delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Convert file to data URI for persistent storage
      const fileData = await fileToDataURI(file);
      
      const newAssignment = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        date: new Date().toLocaleString(),
        fileURL: URL.createObjectURL(file),
        fileData: fileData  // Store the data URI
      };

      // Save to localStorage
      const updatedAssignments = [newAssignment, ...assignments];
      localStorage.setItem("assignments", JSON.stringify(updatedAssignments));

      // Update state
      setAssignments(updatedAssignments);
      setFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Show success message
      alert("Assignment uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload assignment. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle file download
  const handleDownload = (fileURL, fileName) => {
    const link = document.createElement("a");
    link.href = fileURL;
    link.download = fileName;
    document.body.appendChild(link); // Needed for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
  };

  // Handle file sharing (copy to clipboard)
  const handleShare = (fileURL) => {
    // Creating a temporary sharing link since object URLs can't be shared
    // In a real app, you'd use a server-side solution
    const shareText = `Assignment: ${fileURL} (Note: This link only works on this device)`;
    
    navigator.clipboard.writeText(shareText).then(() => {
      alert("Link information copied to clipboard!");
    }).catch(err => {
      console.error("Failed to copy:", err);
      alert("Failed to copy link to clipboard.");
    });
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      assignments.forEach(assignment => {
        if (assignment.fileURL) {
          URL.revokeObjectURL(assignment.fileURL);
        }
      });
    };
  }, [assignments]);

  return (
    <div className="assignment-upload-container">
      <header className="assignment-upload-header">
        <h1>Student Assignment Portal</h1>
        <p>Upload, manage, and track all your course assignments in one place</p>
      </header>

      <section className="upload-section">
        <h2 className="section-title">
          <FaUpload /> Upload Assignment
        </h2>
        
        <div className="file-upload-area" onClick={handleUploadAreaClick}>
          <FaFileAlt />
          <p>Drag and drop your file here or click to browse</p>
          <p className="file-types">Supported file types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG</p>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            className="file-input" 
          />
        </div>

        {file && (
          <div className="selected-file">
            <div className="file-icon">
              {getFileIcon(file.type)}
            </div>
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-meta">
                {formatFileSize(file.size)} • {file.type}
              </div>
            </div>
          </div>
        )}

        <button 
          className="upload-button" 
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          <FaUpload /> {uploading ? "Uploading..." : "Upload Assignment"}
        </button>
      </section>

      <section className="history-section">
        <h2 className="section-title">
          <FaFileAlt /> Uploaded Assignments History
        </h2>
        
        {assignments.length === 0 ? (
          <div className="empty-list">
            <p>No assignments uploaded yet.</p>
          </div>
        ) : (
          <ul className="assignment-list">
            {assignments.map((assignment) => (
              <li key={assignment.id} className="assignment-item">
                <div className="assignment-header">
                  <div>
                    <div className="assignment-name">{assignment.name}</div>
                    <div className="assignment-date">Uploaded on: {assignment.date}</div>
                  </div>
                </div>
                
                <div className="assignment-meta">
                  <div className="meta-item">
                    <FaFile /> {formatFileSize(assignment.size)}
                  </div>
                  <div className="meta-item">
                    {getFileIcon(assignment.type)} {assignment.type.split('/')[1]}
                  </div>
                </div>
                
                <div className="assignment-actions">
                  {(assignment.type.startsWith("image") || assignment.type === "application/pdf") && (
                    <a 
                      href={assignment.fileURL} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="action-button view-button"
                    >
                      <FaEye /> View
                    </a>
                  )}
                  
                  <button 
                    className="action-button download-button" 
                    onClick={() => handleDownload(assignment.fileURL, assignment.name)}
                  >
                    <FaDownload /> Download
                  </button>
                  
                  <button 
                    className="action-button share-button" 
                    onClick={() => handleShare(assignment.fileURL)}
                  >
                    <FaShareAlt /> Share
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AssignmentUpload;
