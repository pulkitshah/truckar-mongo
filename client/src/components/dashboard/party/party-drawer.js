import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { API, DataStore, graphqlOperation, Storage } from "aws-amplify";
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
import { X as XIcon } from "../../../icons/x";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import { partyApi } from "../../../api/party-api";
import { AddressCard } from "./party-address-card";
import { Plus } from "../../../icons/plus";
import { PartyAddressForm } from "./party-address-form";
import { addressApi } from "../../../api/address-api";
import { useAuth } from "../../../hooks/use-auth";
import { useSelector } from "react-redux";
import { useMounted } from "../../../hooks/use-mounted";

const PartyPreview = (props) => {
  const dispatch = useDispatch();
  const isMounted = useMounted();
  const { user } = useAuth();
  const { lgUp, onEdit, party } = props;

  const align = lgUp ? "horizontal" : "vertical";
  const { addresses } = useSelector((state) => state.addresses);
  const [status, setStatus] = useState(false);
  const toggleStatus = () => {
    setStatus(!status);
  };

  console.log(addresses);

  const getAddressesByUser = useCallback(async () => {
    try {
      await addressApi.getAddressesByUser(user, dispatch);
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    try {
      getAddressesByUser();
    } catch (error) {
      console.log(error);
    }
  }, [party]);

  return (
    <>
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
          Party Details
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
      <Divider sx={{ my: 1 }} />

      <PropertyList>
        <PropertyListItem
          align={align}
          disableGutters
          label="Name"
          value={party.name}
        />

        <PropertyListItem
          align={align}
          disableGutters
          label="City"
          value={JSON.parse(party.city).description}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="Mobile"
          value={party.mobile}
        />
      </PropertyList>
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
          Addresses (Consignor/Consignee)
        </Typography>
        {!status && (
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
              onClick={toggleStatus}
              size="small"
              startIcon={<Plus fontSize="small" />}
              sx={{ pt: 3 }}
            >
              Add
            </Button>
          </Box>
        )}
      </Box>
      {status && (
        <PartyAddressForm
          party={party}
          address={{}}
          toggleStatus={toggleStatus}
          type="new"
        />
      )}
      {!status &&
        addresses.map((address) => {
          if (address.party && address.party.id === party.id) {
            return (
              <AddressCard party={party} address={address} key={address._id} />
            );
          }
        })}
    </>
  );
};

const PartyForm = (props) => {
  const { onCancel, party } = props;
  const dispatch = useDispatch();
  const [file, setFile] = useState();
  const [croppedImage, setCroppedImage] = useState();

  const formik = useFormik({
    initialValues: {
      id: party.id,
      name: party.name,
      make: party.make,
      model: party.model,
      _version: party._version,
    },
    // validationSchema: Yup.object({
    //   name: Yup.string().max(255).required("Name is required"),
    //   initials: Yup.string().max(255).required("Required"),
    //   addressLine1: Yup.string()
    //     .max(255)
    //     .required("Address Line 1 is required"),
    //   city: Yup.string().max(255).required("City is required"),
    //   pincode: Yup.string().max(255).required("Pincode is required"),
    //   gstin: Yup.string()
    //     .trim()
    //     .matches(
    //       /^([0-9]){2}([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}([0-9]){1}([a-zA-Z]){1}([0-9]){1}?$/,
    //       "Invalid GST Number"
    //     ),
    //   pan: Yup.string().max(255).required("PAN is required"),
    //   jurisdiction: Yup.string().max(255).required("Jurisdiction is required"),
    // }),
    onSubmit: async (values, helpers) => {
      try {
        // NOTE: Make API request
        const filename = `${party.user}_partyLogo_${party.id}`;
        let logoBase64;
        let logo;
        if (values.logo) {
          logoBase64 = await fetch(values.logo);
          logo = await logoBase64.blob();
          values.logo = filename;
          await Storage.put(filename, logo);
        }

        await partyApi.updateParty(values, dispatch);

        toast.success("Party updated!");
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

  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Box
          sx={{
            alignItems: "center",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
            bpartyRadius: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
          }}
        >
          <Typography variant="overline" sx={{ mr: 2 }} color="textSecondary">
            Party
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

        <Typography sx={{ my: 3 }} variant="h6">
          Details
        </Typography>

        <TextField
          margin="normal"
          error={Boolean(formik.touched.name && formik.errors.name)}
          fullWidth
          helperText={formik.touched.name && formik.errors.name}
          label="Name"
          name="name"
          onBlur={formik.handleBlur}
          onChange={(event) => {
            formik.setFieldValue(`name`, event.target.value);
          }}
          value={formik.values.name}
          variant="outlined"
        />

        <TextField
          margin="normal"
          error={Boolean(formik.touched.make && formik.errors.make)}
          fullWidth
          helperText={formik.touched.make && formik.errors.make}
          label="Make"
          name="make"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.make}
          variant="outlined"
        />
        <TextField
          margin="normal"
          error={Boolean(formik.touched.model && formik.errors.model)}
          fullWidth
          helperText={formik.touched.model && formik.errors.model}
          label="Model"
          name="model"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.model}
          variant="outlined"
        />

        <Button color="error" sx={{ mt: 3 }}>
          Delete party
        </Button>
      </form>
    </>
  );
};

const PartyDrawerDesktop = styled(Drawer)({
  width: 500,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    position: "relative",
    width: 500,
  },
});

const PartyDrawerMobile = styled(Drawer)({
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

export const PartyDrawer = (props) => {
  const { containerRef, onClose, open, party, ...other } = props;
  const [isEditing, setIsEditing] = useState(false);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // The reason for doing this, is that the persistent drawer has to be rendered, but not it's
  // content if an party is not passed.
  const content = party ? (
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
          {party.number}
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
          <React.Fragment>
            <PartyPreview
              onApprove={onClose}
              onEdit={handleEdit}
              onReject={onClose}
              party={party}
              lgUp={lgUp}
            />
          </React.Fragment>
        ) : (
          <PartyForm onCancel={handleCancel} party={party} />
        )}
      </Box>
    </>
  ) : null;

  if (lgUp) {
    return (
      <PartyDrawerDesktop
        anchor="right"
        open={open}
        SlideProps={{ container: containerRef?.current }}
        variant="persistent"
        {...other}
      >
        {content}
      </PartyDrawerDesktop>
    );
  }

  return (
    <PartyDrawerMobile
      anchor="right"
      ModalProps={{ container: containerRef?.current }}
      onClose={onClose}
      open={open}
      SlideProps={{ container: containerRef?.current }}
      variant="temporary"
      {...other}
    >
      {content}
    </PartyDrawerMobile>
  );
};

PartyDrawer.propTypes = {
  containerRef: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  party: PropTypes.object,
};
