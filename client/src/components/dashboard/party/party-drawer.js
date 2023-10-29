import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";

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
import GoogleMaps from "./google-places-autocomplete";

const PartyPreview = (props) => {
  const dispatch = useDispatch();
  const isMounted = useMounted();
  const { account } = useAuth();
  const { lgUp, onEdit, party } = props;

  const align = lgUp ? "horizontal" : "vertical";
  const { addresses } = useSelector((state) => state.addresses);
  const [status, setStatus] = useState(false);
  const toggleStatus = () => {
    setStatus(!status);
  };

  console.log(addresses);

  const getAddressesByAccount = useCallback(async () => {
    try {
      await addressApi.getAddressesByAccount({ account, dispatch });
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    try {
      getAddressesByAccount();
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
          value={party.city ? party.city.description : ""}
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
          if (address.party && address.party._id === party._id) {
            return (
              <AddressCard party={party} address={address} key={address._id} />
            );
          }
        })}
    </>
  );
};

const PartyForm = (props) => {
  const { onOpen, onCancel, party } = props;
  const dispatch = useDispatch();
  const { account } = useAuth();

  const isDrawerOpen = useRef(true);
  useLayoutEffect(() => {
    if (isDrawerOpen.current) {
      isDrawerOpen.current = false;
      return;
    }
    onCancel();
  }, [party]);

  const formik = useFormik({
    initialValues: {
      _id: party._id,
      name: party.name || "",
      mobile: party.mobile || "",
      city: party.city || "",
      account: party.account,
      isTransporter: party.isTransporter || false,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .max(255)
        .required("Name is required")
        .test(
          "Unique Name",
          "A party already exists with this name", // <- key, message
          async function (value) {
            if (value === party.name) {
              return true;
            }
            try {
              const response = await partyApi.validateDuplicateName({
                account,
                value,
              });
              return response.data;
            } catch (error) {}
          }
        ),
      mobile: Yup.string()
        .matches(/^[6-9]\d{9}$/, "Mobile is not valid")
        .required("Mobile is required")
        .test(
          "Unique Mobile",
          "Mobile already in use", // <- key, message
          async function (value) {
            if (value === party.mobile) {
              return true;
            }
            try {
              const response = await partyApi.validateDuplicateMobile({
                account,
                value,
              });
              return response.data;
            } catch (error) {}
          }
        ),
    }),
    onSubmit: async (values, helpers) => {
      try {
        // NOTE: Make API request

        let { data } = await partyApi.updateParty(values, dispatch);

        toast.success("Party updated!");
        onOpen({ row: data });
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
          error={Boolean(formik.touched.mobile && formik.errors.mobile)}
          fullWidth
          helperText={formik.touched.mobile && formik.errors.mobile}
          label="Mobile"
          name="mobile"
          onBlur={formik.handleBlur}
          onChange={async (event) => {
            formik.setFieldValue(
              "mobile",
              event.target.value.replace(/ /g, "")
            );
          }}
          value={formik.values.mobile}
          variant="outlined"
        />
        <GoogleMaps
          sx={{ pt: 2 }}
          formik={formik}
          error={Boolean(formik.touched.city && formik.errors.city)}
          label={"City"}
          field={"city"}
          setFieldValue={formik.setFieldValue}
          handleBlur={formik.handleBlur}
          values={formik.values}
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
  const { containerRef, onOpen, onClose, open, party, ...other } = props;
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
          <PartyForm onOpen={onOpen} onCancel={handleCancel} party={party} />
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
