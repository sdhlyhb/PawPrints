import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import CancelIcon from "@mui/icons-material/Cancel";
import useSendImage from "../../hooks/useSendImage";

export default function SendImage() {
  const { isLoading, error, uploadAndSend } = useSendImage();
  const [imageFile, setImageFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const webcamRef = useRef();
  const navigate = useNavigate();

  useEffect(() => () => URL.revokeObjectURL(imageSrc), [imageSrc]);

  const handleCapture = useCallback(async () => {
    const snapSrc = webcamRef.current.getScreenshot();
    const randomFileName = Math.random().toString(36).slice(2);

    const snapFile = await fetch(snapSrc)
      .then((res) => res.arrayBuffer())
      .then(
        (buffer) =>
          new File([buffer], `${randomFileName}.jpeg`, { type: "image/jpeg" })
      );

    setImageSrc(snapSrc);
    setImageFile(snapFile);
  }, [webcamRef]);

  const handleFileInput = (e) => {
    e.preventDefault();
    const selectedFile = e.target.files[0];
    const objectUrl = URL.createObjectURL(selectedFile);
    setImageSrc(objectUrl);
    setImageFile(selectedFile);
    console.log(objectUrl, imageSrc);
  };

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  return (
    <>
      {imageSrc ? (
        <IconButton
          color="primary"
          component="label"
          sx={{ position: "fixed", top: 0, left: 0 }}
          size="large"
          onClick={() => setImageSrc(null)}
        >
          <CancelIcon fontSize="inherit" />
        </IconButton>
      ) : (
        <IconButton
          color="primary"
          component="label"
          sx={{ position: "fixed", top: 0, left: 0 }}
          size="large"
          onClick={handleBackButtonClick}
        >
          <ArrowCircleLeftIcon fontSize="inherit" />
        </IconButton>
      )}
      <Paper
        sx={{
          minHeight: "80vh",
          width: "90%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "fixed",
          top: "7%",
          left: "5%",
          border: "1px dashed grey",
          borderRadius: "2%",
        }}
        elevation={2}
      >
        {error && <p>Error: {error}</p>}
        {isLoading && <p>loading...</p>}
        {imageSrc ? (
          <div>
            <img
              src={imageSrc}
              alt="preview"
              style={{ height: 400, width: 300, objectFit: "contain" }}
            />
          </div>
        ) : (
          <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" />
        )}
      </Paper>

      <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="label"
          size="large"
        >
          <input
            hidden
            data-testid="select-img"
            accept="image/*"
            type="file"
            onChange={handleFileInput}
          />
          <CloudUploadIcon fontSize="large" />
        </IconButton>

        <button onClick={handleCapture} disabled={imageSrc}>Capture</button>

        <IconButton
          disabled={!imageSrc}
          color="primary"
          component="label"
          sx={{ left: "45%" }}
          onClick={(event) => {
            event.preventDefault();
            uploadAndSend(imageFile);
          }}
        >
          <SendIcon fontSize="large" />
        </IconButton>
      </Box>
    </>
  );
}
