import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../../hooks/use-auth";
import { vehicleApi } from "../../../api/vehicle-api";
import { useDispatch } from "../../../store";
import { vehicleNumberFormatter } from "../../../utils/customFormatters";
import OrganisationAutocomplete from "../autocompletes/organisation-autcomplete/organisation-autocomplete";

export const VehicleCreateForm = (props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { account } = useAuth();
  const formik = useFormik({
    initialValues: {
      vehicleNumber: "",
      make: "",
      model: "",
      organisation: "",
      account: account.id,
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
              const response = await vehicleApi.validateDuplicateVehicleNumber(
                account,
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
        console.log(values);
        await vehicleApi.createVehicle(values, dispatch);

        toast.success("Vehicle created!");
        router.push("/dashboard/vehicles");
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
    <form onSubmit={formik.handleSubmit} {...props}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Truck details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={6} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.vehicleNumber &&
                        formik.errors.vehicleNumber
                    )}
                    fullWidth
                    helperText={
                      formik.touched.vehicleNumber &&
                      formik.errors.vehicleNumber
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
                </Grid>
                <Grid item md={6} xs={12}>
                  <OrganisationAutocomplete formik={formik} />
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
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
                </Grid>
                <Grid item md={6} xs={12}>
                  <TextField
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
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          mx: -1,
          mb: -1,
          mt: 3,
        }}
      >
        <Button
          color="error"
          sx={{
            m: 1,
            mr: "auto",
          }}
        >
          Delete
        </Button>
        <Button sx={{ m: 1 }} variant="outlined">
          Cancel
        </Button>
        <Button sx={{ m: 1 }} type="submit" variant="contained">
          Create
        </Button>
      </Box>
    </form>
  );
};
