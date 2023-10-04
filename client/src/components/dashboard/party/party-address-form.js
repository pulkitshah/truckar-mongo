import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import { v4 as uuid } from "uuid";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import GoogleMaps from "./google-places-autocomplete";
import { addressApi } from "../../../api/address-api";

export const PartyAddressForm = (props) => {
  const { party, address, toggleStatus, type } = props;
  const router = useRouter();
  const dispatch = useDispatch();
  const { account } = useAuth();

  const formik = useFormik({
    initialValues: {
      name: address.name || "",
      gstin: address.gstin || "",
      pan: address.pan || "",
      billingAddressLine1: address.billingAddressLine1 || "",
      billingAddressLine2: address.billingAddressLine2 || "",
      city: address.city ? address.city : "",
      party: party,
      account: account._id,
    },
    onSubmit: async (values, helpers) => {
      try {
        // NOTE: Make API request
        if (type !== "new") values._id = address._id;
        type === "new"
          ? await addressApi.createAddress({ values, dispatch })
          : await addressApi.updateAddress({ values, dispatch });
        toggleStatus();
        toast.success("Party updated!");
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
            my: 2.5,
          }}
        >
          <Typography variant="overline" sx={{ mr: 2 }} color="textSecondary">
            {type === "new" ? "Create Address" : "Update Address"}
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
              Save Address
            </Button>
            <Button onClick={toggleStatus} size="small" variant="outlined">
              Cancel
            </Button>
          </Box>
        </Box>

        <Typography sx={{ mt: 3 }} variant="h6">
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
            formik.setFieldValue(
              "name",
              event.target.value.replace(/\w\S*/g, function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              })
            );
          }}
          value={formik.values.name}
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
          onChange={formik.handleChange}
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
          error={Boolean(
            formik.touched.billingAddressLine1 &&
              formik.errors.billingAddressLine1
          )}
          fullWidth
          helperText={
            formik.touched.billingAddressLine1 &&
            formik.errors.billingAddressLine1
          }
          label="Billing Address Line 1"
          name="billingAddressLine1"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.billingAddressLine1}
          variant="outlined"
        />
        <TextField
          margin="normal"
          error={Boolean(
            formik.touched.billingAddressLine2 &&
              formik.errors.billingAddressLine2
          )}
          fullWidth
          helperText={
            formik.touched.billingAddressLine2 &&
            formik.errors.billingAddressLine2
          }
          label="Billing Address Line 2"
          name="billingAddressLine2"
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          value={formik.values.billingAddressLine2}
          variant="outlined"
        />
        <GoogleMaps
          formik={formik}
          error={Boolean(formik.touched.city && formik.errors.city)}
          label={"City"}
          field={"city"}
          setFieldValue={formik.setFieldValue}
          handleBlur={formik.handleBlur}
          values={formik.values}
        />
        <Box mt={2} mb={5}>
          <Button
            style={{ marginRight: 10 }}
            variant="contained"
            color="secondary"
            type="submit"
          >
            {type === "new" ? "Create Address" : "Update Address"}
          </Button>

          <Button variant="contained" color="primary" onClick={toggleStatus}>
            Cancel
          </Button>
        </Box>
      </form>
    </>
  );
};
