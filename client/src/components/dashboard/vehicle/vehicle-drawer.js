import { useRef, useState, useLayoutEffect } from "react";
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
import { useAuth } from "../../../hooks/use-auth";
import { vehicleApi } from "../../../api/vehicle-api";
import { vehicleNumberFormatter } from "../../../utils/customFormatters";
import OrganisationAutocomplete from "../autocompletes/organisation-autcomplete/organisation-autocomplete";

const VehiclePreview = (props) => {
  const { lgUp, onEdit, vehicle } = props;
  const align = lgUp ? "horizontal" : "vertical";

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
        <PropertyListItem
          align={align}
          disableGutters
          label="Vehicle Number"
          value={vehicle.vehicleNumber.toUpperCase()}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="Organisation"
          value={vehicle.organisation.name}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="Make"
          value={vehicle.make}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="Model"
          value={vehicle.model}
        />
      </PropertyList>
    </>
  );
};

const VehicleForm = (props) => {
  const dispatch = useDispatch();
  const { account } = useAuth();
  const { onOpen, onCancel, vehicle } = props;

  const isDrawerOpen = useRef(true);
  useLayoutEffect(() => {
    if (isDrawerOpen.current) {
      isDrawerOpen.current = false;
      return;
    }
    onCancel();
  }, [vehicle]);

  const formik = useFormik({
    initialValues: {
      _id: vehicle._id,
      vehicleNumber: vehicle.vehicleNumber,
      make: vehicle.make,
      model: vehicle.model,
      organisation: vehicle.organisation,
    },
    validationSchema: Yup.object({
      vehicleNumber: Yup.string()
        .max(255)
        .required("Vehicle Number is required")
        .test(
          "Unique Name",
          "Vehicle with this vehicle number exists", // <- key, message
          async function (value) {
            try {
              if (value === vehicle.vehicleNumber) {
                return true;
              }
              const response = await vehicleApi.validateDuplicateVehicleNumber(
                account._id,
                value
              );
              return response.data;
            } catch (error) {
              console.log(error);
            }
          }
        ),
      make: Yup.string().max(255).required("Make is required"),
      model: Yup.string().max(255).required("Model is required"),
    }),
    onSubmit: async (values, helpers) => {
      try {
        // NOTE: Make API request
        let { data } = await vehicleApi.updateVehicle(dispatch, values);

        toast.success("Vehicle updated!");
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
            bvehicleRadius: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
          }}
        >
          <Typography variant="overline" sx={{ mr: 2 }} color="textSecondary">
            Vehicle
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
          error={Boolean(
            formik.touched.vehicleNumber && formik.errors.vehicleNumber
          )}
          fullWidth
          helperText={
            formik.touched.vehicleNumber && formik.errors.vehicleNumber
          }
          label="Vehicle Number"
          name="vehicleNumber"
          onBlur={formik.handleBlur}
          onChange={(event) => {
            formik.setFieldValue(
              `vehicleNumber`,
              event.target.value.toUpperCase()
            );
          }}
          value={formik.values.vehicleNumber}
          variant="outlined"
          inputProps={{ style: { textTransform: "uppercase" } }}
          InputProps={{
            inputComponent: vehicleNumberFormatter,
          }}
        />
        <OrganisationAutocomplete sx={{ pt: 2 }} formik={formik} />

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
      </form>
    </>
  );
};

const VehicleDrawerDesktop = styled(Drawer)({
  width: 500,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    position: "relative",
    width: 500,
  },
});

const VehicleDrawerMobile = styled(Drawer)({
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

export const VehicleDrawer = (props) => {
  const { containerRef, onOpen, onClose, open, vehicle, ...other } = props;
  const [isEditing, setIsEditing] = useState(false);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // The reason for doing this, is that the persistent drawer has to be rendered, but not it's
  // content if an vehicle is not passed.
  const content = vehicle ? (
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
          {vehicle.number}
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
          <VehiclePreview
            onApprove={onClose}
            onEdit={handleEdit}
            onReject={onClose}
            vehicle={vehicle}
            lgUp={lgUp}
          />
        ) : (
          <VehicleForm
            onOpen={onOpen}
            onCancel={handleCancel}
            vehicle={vehicle}
          />
        )}
      </Box>
    </>
  ) : null;

  if (lgUp) {
    return (
      <VehicleDrawerDesktop
        anchor="right"
        open={open}
        SlideProps={{ container: containerRef?.current }}
        variant="persistent"
        {...other}
      >
        {content}
      </VehicleDrawerDesktop>
    );
  }

  return (
    <VehicleDrawerMobile
      anchor="right"
      ModalProps={{ container: containerRef?.current }}
      onClose={onClose}
      open={open}
      SlideProps={{ container: containerRef?.current }}
      variant="temporary"
      {...other}
    >
      {content}
    </VehicleDrawerMobile>
  );
};

VehicleDrawer.propTypes = {
  containerRef: PropTypes.any,
  onClose: PropTypes.func,
  onOpen: PropTypes.func,
  open: PropTypes.bool,
  vehicle: PropTypes.object,
};
