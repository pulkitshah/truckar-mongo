import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDropzone } from "react-dropzone";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

import { Box, Button, Link, Typography } from "@mui/material";

export const OrganisationLogoDropzone = (props) => {
  const {
    accept,
    croppedImage,
    disabled,
    displayInDrawer,
    file,
    getFilesFromEvent,
    maxFiles,
    maxSize,
    minSize,
    noClick,
    noDrag,
    noDragEventsBubbling,
    noKeyboard,
    onDrop,
    onDropAccepted,
    onDropRejected,
    onFileDialogCancel,
    onRemove,
    onRemoveAll,
    onSaveCroppedImage,
    onUpload,
    preventDropOnDocument,
    showModal,
    onModalClose,
    imgURL,
    onSaveHandler,
    ...other
  } = props;

  // We did not add the remaining props to avoid component complexity
  // but you can simply add it if you need to.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    minSize,
    onDrop,
    onDropAccepted,
  });

  const cropperRef = useRef(null);
  const [cropper, setCropper] = useState();

  const getCroppedImage = () => {
    if (typeof cropper !== "undefined") {
      onSaveCroppedImage(cropper);
    }
  };

  return (
    <div {...other}>
      {!file && (
        <Box
          sx={{
            alignItems: "center",
            border: 1,
            borderRadius: 1,
            borderStyle: "dashed",
            borderColor: "divider",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            outline: "none",
            p: displayInDrawer ? 0.5 : 6,
            ...(isDragActive && {
              backgroundColor: "action.active",
              opacity: 0.5,
            }),
            "&:hover": {
              backgroundColor: "action.hover",
              cursor: "pointer",
              opacity: 0.5,
            },
          }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />

          <Box
            sx={{
              "& img": {
                width: displayInDrawer ? 40 : 100,
              },
            }}
          >
            <img alt="Select file" src="/static/undraw_add_file2_gvbb.svg" />
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="h6">
              {`Select logo${maxFiles && maxFiles === 1 ? "" : "s"}`}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                {`Drop image${maxFiles && maxFiles === 1 ? "" : "s"} or `}{" "}
                <Link underline="always">browse</Link> thorough your machine
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
      {file && !croppedImage && (
        <Box sx={{ mt: 2 }}>
          <Cropper
            src={file.preview}
            style={{ width: "100%", height: "auto" }}
            viewMode={0}
            cropBoxResizable={false}
            guides={true}
            aspectRatio={4.5}
            background={false}
            ref={cropperRef}
            minCropBoxHeight={67.5}
            minCropBoxWidth={15}
            responsive={true}
            autoCropArea={1}
            onInitialized={(instance) => {
              setCropper(instance);
            }}
            checkOrientation={false}
            toggleDragModeOnDblclick={false}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 2,
            }}
          >
            <Button onClick={onRemove} size="small" type="button">
              Remove
            </Button>
            <Button
              onClick={getCroppedImage}
              size="small"
              sx={{ ml: 2 }}
              type="button"
              variant="contained"
            >
              Save
            </Button>
          </Box>
        </Box>
      )}

      {}
    </div>
  );
};

OrganisationLogoDropzone.propTypes = {
  accept: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  disabled: PropTypes.bool,
  file: PropTypes.array,
  getFilesFromEvent: PropTypes.func,
  maxFiles: PropTypes.number,
  maxSize: PropTypes.number,
  minSize: PropTypes.number,
  noClick: PropTypes.bool,
  noDrag: PropTypes.bool,
  noDragEventsBubbling: PropTypes.bool,
  noKeyboard: PropTypes.bool,
  onDrop: PropTypes.func,
  onDropAccepted: PropTypes.func,
  onDropRejected: PropTypes.func,
  onFileDialogCancel: PropTypes.func,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  onUpload: PropTypes.func,
  preventDropOnDocument: PropTypes.bool,
};

OrganisationLogoDropzone.defaultProps = {
  files: [],
};
