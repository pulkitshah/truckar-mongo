import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import { Storage } from "aws-amplify";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import { useDispatch } from "../../../store";
import { useMounted } from "../../../hooks/use-mounted";
import { X as XIcon } from "../../../icons/x";
import { getInitials } from "../../../utils/get-initials";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import { organisationApi } from "../../../api/organisation-api";
import { OrganisationLogoDropzone } from "./organisation-logo-dropzone";

import S3 from "react-aws-s3";

const config = {
  bucketName: "truckarprod",
  dirName: "media/logos" /* optional */,
  region: "ap-south-1",
  accessKeyId: "AKIAZRZV5R3N7OYQNHHA",
  secretAccessKey: "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",
};

const ReactS3Client = new S3(config);

const OrganisationPreview = (props) => {
  const dispatch = useDispatch();

  const { lgUp, onEdit, organisation } = props;
  const align = lgUp ? "horizontal" : "vertical";
  const [file, setFile] = useState();
  const [croppedImage, setCroppedImage] = useState();

  const handleDrop = (newFile) => {
    newFile.length > 0 &&
      setFile(
        Object.assign(newFile[0], {
          preview: URL.createObjectURL(newFile[0]),
        })
      );
  };

  const handleRemove = (file) => {
    setFile();
    setCroppedImage("");
  };

  const handleSaveCroppedImage = async (cropper) => {
    let logoBase64;
    let logo;
    if (values.logo) {
      logoBase64 = await fetch(cropper.getCroppedCanvas().toDataURL());
      logo = await logoBase64.blob();
    }

    ReactS3Client.uploadFile(logo, `${organisation._id}/logo`)
      .then(async (data) => {
        console.log(data);
        let updatedOrganisation = await organisationApi.updateOrganisation(
          { _id: organisation._id, logo: data },
          dispatch
        );
        console.log(updatedOrganisation);
      })
      .catch((err) => console.error(err));
  };

  console.log(organisation);

  return (
    <>
      {organisation.logo && (
        <img
          style={{ width: "100%", height: "auto" }}
          src={`${organisation.logo.location}?${Math.random()}`}
          alt="Business Logo"
        />
      )}
      {!organisation.logo && (
        <OrganisationLogoDropzone
          accept="image/*"
          file={file}
          croppedImage={croppedImage}
          onDrop={handleDrop}
          onRemove={handleRemove}
          maxFiles={1}
          onSaveCroppedImage={handleSaveCroppedImage}
          displayInDrawer={true}
        />
      )}
      <Box
        sx={{
          alignItems: "center",
          borderRadius: 1,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ mt: 3 }} variant="h6">
          Details
        </Typography>
        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            mt: 3,
            m: -1,
            "& > button": {
              m: 1,
            },
          }}
        >
          <Button
            onClick={onEdit}
            size="small"
            startIcon={<EditIcon fontSize="small" />}
            sx={{ pt: 3 }}
          >
            Edit
          </Button>
        </Box>
      </Box>
      <Divider sx={{ my: 3 }} />

      <PropertyList>
        <PropertyListItem align={align} disableGutters label="Business Name">
          <Typography color="primary" variant="body2">
            {`${organisation.name} (${organisation.initials})`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {organisation.addressLine1}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {organisation.addressLine2}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {organisation.city}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {organisation.pincode}
          </Typography>
        </PropertyListItem>

        <PropertyListItem align={align} disableGutters label="Bank Details">
          <Typography color="textSecondary" variant="body2">
            {organisation.bankName}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {organisation.bankAccountNumber &&
              `A/c: ${organisation.bankAccountNumber}`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {organisation.bankIFSC && `IFSC: ${organisation.bankIFSC}`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {organisation.bankBranchName &&
              `Branch: ${organisation.bankBranchName}`}
          </Typography>
        </PropertyListItem>

        <Typography sx={{ mt: 3 }} variant="h6">
          Billing Details
        </Typography>
        <Divider sx={{ my: 3 }} />
        <PropertyListItem
          align={align}
          disableGutters
          label="PAN"
          value={organisation.pan}
        />

        <PropertyListItem
          align={align}
          disableGutters
          label="GSTIN"
          value={organisation.gstin}
        />

        <PropertyListItem
          align={align}
          disableGutters
          label="Contact No."
          value={organisation.contact}
        />

        <PropertyListItem
          align={align}
          disableGutters
          label="E-mail"
          value={organisation.email}
        />

        <PropertyListItem
          align={align}
          disableGutters
          label="LR Terms & Conditions"
          value={organisation.lrTermsAndConditions}
        />

        <PropertyListItem
          align={align}
          disableGutters
          label="Invoice Terms & Conditions"
          value={organisation.invoiceTermsAndConditions}
        />
      </PropertyList>
    </>
  );
};

const OrganisationForm = (props) => {
  const { onCancel, organisation } = props;
  const dispatch = useDispatch();
  const [file, setFile] = useState();
  const [croppedImage, setCroppedImage] = useState();

  const isDrawerOpen = useRef(true);
  useLayoutEffect(() => {
    if (isDrawerOpen.current) {
      isDrawerOpen.current = false;
      return;
    }
    onCancel();
  }, [organisation]);

  const formik = useFormik({
    initialValues: {
      _id: organisation._id,
      name: organisation.name,
      initials: organisation.initials,
      addressLine1: organisation.addressLine1,
      addressLine2: organisation.addressLine2,
      city: organisation.city,
      pincode: organisation.pincode,
      gstin: organisation.gstin,
      pan: organisation.pan,
      invoiceTermsAndConditions: organisation.invoiceTermsAndConditions,
      lrTermsAndConditions: organisation.lrTermsAndConditions,
      bankName: organisation.bankName,
      bankAccountNumber: organisation.bankAccountNumber,
      bankBranchName: organisation.bankBranchName,
      bankIFSC: organisation.bankIFSC,
      contact: organisation.contact,
      _version: organisation._version,
    },
    onSubmit: async (values, helpers) => {
      try {
        // NOTE: Make API request
        let logoBase64;
        let logo;
        if (values.logo) {
          logoBase64 = await fetch(values.logo);
          logo = await logoBase64.blob();
          values.logo = null;
        }

        ReactS3Client.uploadFile(logo, `${organisation._id}/logo`)
          .then(async (data) => {
            console.log(data);
            let updatedOrganisation = await organisationApi.updateOrganisation(
              { _id: organisation._id, logo: data },
              dispatch
            );
            console.log(updatedOrganisation);
          })
          .catch((err) => console.error(err));

        await organisationApi.updateOrganisation(values, dispatch);

        toast.success("Organisation updated!");
        onCancel();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const handleDrop = (newFile) => {
    newFile.length > 0 &&
      setFile(
        Object.assign(newFile[0], {
          preview: URL.createObjectURL(newFile[0]),
        })
      );
  };

  const handleRemove = (file) => {
    setFile();
    setCroppedImage("");
  };

  const handleSaveCroppedImage = (cropper) => {
    setCroppedImage(cropper.getCroppedCanvas().toDataURL());
    formik.setFieldValue(`logo`, cropper.getCroppedCanvas().toDataURL());
  };

  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Box
          sx={{
            alignItems: "center",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
            borganisationRadius: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
          }}
        >
          <Typography variant="overline" sx={{ mr: 2 }} color="textSecondary">
            Organisation
          </Typography>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              m: -1,
              "& > button": {
                m: 1,
              },
            }}
          >
            <Button
              color="primary"
              type="submit"
              size="small"
              variant="contained"
            >
              Save changes
            </Button>
            <Button onClick={onCancel} size="small" variant="outlined">
              Cancel
            </Button>
          </Box>
        </Box>
        <Box sx={{ mt: 3 }}>
          <OrganisationLogoDropzone
            accept="image/*"
            file={file}
            croppedImage={croppedImage}
            onDrop={handleDrop}
            onRemove={handleRemove}
            maxFiles={1}
            onSaveCroppedImage={handleSaveCroppedImage}
            displayInDrawer={true}
          />
          {croppedImage && (
            <img
              style={{ width: "100%", height: "auto" }}
              src={croppedImage}
              alt="cropped"
            />
          )}
          {croppedImage && (
            <Box
              sx={{
                display: "flex",

                mt: 2,
              }}
            >
              <Button onClick={handleRemove} size="small" type="button">
                Remove Logo
              </Button>
            </Box>
          )}
        </Box>

        <Typography sx={{ my: 3 }} variant="h6">
          Details
        </Typography>

        <TextField
          margin="normal"
          error={Boolean(formik.touched.name && formik.errors.name)}
          fullWidth
          helperText={formik.touched.name && formik.errors.name}
          label="Business Name"
          name="name"
          onBlur={formik.handleBlur}
          onChange={(event) => {
            formik.setFieldValue(
              `initials`,
              `${getInitials(event.target.value)}`
            );
            formik.setFieldValue(`name`, event.target.value);
          }}
          value={formik.values.name}
          variant="outlined"
        />

        <TextField
          margin="normal"
          error={Boolean(formik.touched.initials && formik.errors.initials)}
          fullWidth
          helperText={formik.touched.initials && formik.errors.initials}
          label="Initials"
          name="initials"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.initials}
          variant="outlined"
        />
        <TextField
          margin="normal"
          error={Boolean(
            formik.touched.addressLine1 && formik.errors.addressLine1
          )}
          fullWidth
          helperText={formik.touched.addressLine1 && formik.errors.addressLine1}
          label="Address Line 1"
          name="addressLine1"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.addressLine1}
          variant="outlined"
        />
        <TextField
          margin="normal"
          error={Boolean(
            formik.touched.addressLine2 && formik.errors.addressLine2
          )}
          fullWidth
          helperText={formik.touched.addressLine2 && formik.errors.addressLine2}
          label="Address Line 2"
          name="addressLine2"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.addressLine2}
          variant="outlined"
        />
        <TextField
          margin="normal"
          error={Boolean(formik.touched.city && formik.errors.city)}
          fullWidth
          helperText={formik.touched.city && formik.errors.city}
          label="City (Jurisdication)"
          name="city"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.city}
          variant="outlined"
        />
        <TextField
          margin="normal"
          error={Boolean(formik.touched.pincode && formik.errors.pincode)}
          fullWidth
          helperText={formik.touched.pincode && formik.errors.pincode}
          label="Pincode"
          name="pincode"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.pincode}
          variant="outlined"
        />
        <Divider sx={{ my: 3 }} />

        <Typography sx={{ my: 3 }} variant="h6">
          Bank Details
        </Typography>

        <TextField
          margin="normal"
          error={Boolean(formik.touched.bankName && formik.errors.bankName)}
          fullWidth
          helperText={formik.touched.bankName && formik.errors.bankName}
          label="Bank name"
          name="bankName"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.bankName}
          variant="outlined"
        />

        <TextField
          margin="normal"
          error={Boolean(
            formik.touched.bankAccountNumber && formik.errors.bankAccountNumber
          )}
          fullWidth
          helperText={
            formik.touched.bankAccountNumber && formik.errors.bankAccountNumber
          }
          label="Bank Account Number"
          name="bankAccountNumber"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.bankAccountNumber}
          variant="outlined"
        />

        <TextField
          margin="normal"
          error={Boolean(
            formik.touched.bankBranchName && formik.errors.bankBranchName
          )}
          fullWidth
          helperText={
            formik.touched.bankBranchName && formik.errors.bankBranchName
          }
          label="Bank Branch Name"
          name="bankBranchName"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.bankBranchName}
          variant="outlined"
        />

        <TextField
          margin="normal"
          error={Boolean(formik.touched.bankIFSC && formik.errors.bankIFSC)}
          fullWidth
          helperText={formik.touched.bankIFSC && formik.errors.bankIFSC}
          label="Bank IFS Code"
          name="bankIFSC"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.bankIFSC}
          variant="outlined"
        />

        <Divider sx={{ my: 3 }} />
        <Typography sx={{ my: 3 }} variant="h6">
          Billing Details
        </Typography>

        <TextField
          margin="normal"
          error={Boolean(formik.touched.contact && formik.errors.contact)}
          fullWidth
          helperText={formik.touched.contact && formik.errors.contact}
          label="Contact"
          name="contact"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.contact}
          variant="outlined"
        />
        <TextField
          margin="normal"
          error={Boolean(formik.touched.email && formik.errors.email)}
          fullWidth
          helperText={formik.touched.email && formik.errors.email}
          label="Email"
          name="email"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.email}
          variant="outlined"
        />
        <TextField
          margin="normal"
          error={Boolean(formik.touched.gstin && formik.errors.gstin)}
          fullWidth
          helperText={formik.touched.gstin && formik.errors.gstin}
          label="GSTIN"
          name="gstin"
          onBlur={formik.handleBlur}
          onChange={(event) => {
            formik.setFieldValue(`gstin`, `${event.target.value}`);
            formik.setFieldValue(`pan`, `${event.target.value.substr(2, 11)}`);
          }}
          value={formik.values.gstin}
          variant="outlined"
        />
        <TextField
          margin="normal"
          error={Boolean(formik.touched.pan && formik.errors.pan)}
          fullWidth
          helperText={formik.touched.pan && formik.errors.pan}
          label="PAN"
          name="pan"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.pan}
          variant="outlined"
        />
        <TextField
          margin="normal"
          multiline
          error={Boolean(
            formik.touched.lrTermsAndConditions &&
              formik.errors.lrTermsAndConditions
          )}
          fullWidth
          helperText={
            formik.touched.lrTermsAndConditions &&
            formik.errors.lrTermsAndConditions
          }
          label="LR Terms and Conditions"
          name="lrTermsAndConditions"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.lrTermsAndConditions}
          variant="outlined"
          rows={6}
        />
        <TextField
          margin="normal"
          multiline
          error={Boolean(
            formik.touched.invoiceTermsAndConditions &&
              formik.errors.invoiceTermsAndConditions
          )}
          fullWidth
          helperText={
            formik.touched.invoiceTermsAndConditions &&
            formik.errors.invoiceTermsAndConditions
          }
          label="Bill Terms and Conditions"
          name="invoiceTermsAndConditions"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.invoiceTermsAndConditions}
          variant="outlined"
          rows={6}
        />

        <Button color="error" sx={{ mt: 3 }}>
          Delete organisation
        </Button>
      </form>
    </>
  );
};

const OrganisationDrawerDesktop = styled(Drawer)({
  width: 500,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    position: "relative",
    width: 500,
  },
});

const OrganisationDrawerMobile = styled(Drawer)({
  flexShrink: 0,
  maxWidth: "100%",
  height: "calc(100% - 64px)",
  width: 500,
  "& .MuiDrawer-paper": {
    height: "calc(100% - 64px)",
    maxWidth: "100%",
    top: 64,
    width: 500,
  },
});

export const OrganisationDrawer = (props) => {
  const { containerRef, onClose, open, organisation, ...other } = props;
  const [isEditing, setIsEditing] = useState(false);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // The reason for doing this, is that the persistent drawer has to be rendered, but not it's
  // content if an organisation is not passed.
  const content = organisation ? (
    <>
      <Box
        sx={{
          alignItems: "center",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Typography color="inherit" variant="h6">
          {organisation.number}
        </Typography>
        <IconButton color="inherit" onClick={onClose}>
          <XIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{
          px: 3,
          py: 4,
        }}
      >
        {!isEditing ? (
          <OrganisationPreview
            onApprove={onClose}
            onEdit={handleEdit}
            onReject={onClose}
            organisation={organisation}
            lgUp={lgUp}
          />
        ) : (
          <OrganisationForm
            onCancel={handleCancel}
            organisation={organisation}
          />
        )}
      </Box>
    </>
  ) : null;

  if (lgUp) {
    return (
      <OrganisationDrawerDesktop
        anchor="right"
        open={open}
        SlideProps={{ container: containerRef?.current }}
        variant="persistent"
        {...other}
      >
        {content}
      </OrganisationDrawerDesktop>
    );
  }

  return (
    <OrganisationDrawerMobile
      anchor="right"
      ModalProps={{ container: containerRef?.current }}
      onClose={onClose}
      open={open}
      SlideProps={{ container: containerRef?.current }}
      variant="temporary"
      {...other}
    >
      {content}
    </OrganisationDrawerMobile>
  );
};

OrganisationDrawer.propTypes = {
  containerRef: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  organisation: PropTypes.object,
};
