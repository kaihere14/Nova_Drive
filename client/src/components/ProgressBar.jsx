import React from "react";

const ProgressBar = ({ uploading, processing, progress }) => {
  if (!uploading && !processing) return null;

  return (
    <div className="upload-progress">
      {uploading && (
        <>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="progress-text">Uploading: {progress}%</p>
        </>
      )}
      {processing && <p className="progress-text">Processing file...</p>}
      <div className="spinner"></div>
    </div>
  );
};

export default ProgressBar;
