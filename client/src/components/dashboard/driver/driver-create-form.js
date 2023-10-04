import { forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import { driverApi } from "../../../api/driver-api";
import VehicleAutocomplete from "../autocompletes/vehicle-autocomplete/vehicle-autocomplete";

export const DriverCreateForm = forwardRef(({ handleNext, ...props }, ref) => {
  const { account } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();

  useImperativeHandle(ref, () => ({
    handleFormSubmit() {
      formik.handleSubmit();
    },
  }));

  const formik = useFormik({
    initialValues: {
      driverName: "",
      vehicle: "",
      mobile: "",
      city: "",
      driverType: "main",
      account: account._id,
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(255)
        .required("Name is required")
        .test(
          "Unique Name",
          "A driver already exists with this name", // <- key, message
          async function (value) {
            try {
              const response = await driverApi.validateDuplicateName(
                account._id,
                value
              );
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
            try {
              const response = await driverApi.validateDuplicateMobile(
                account._id,
                value
              );
              return response.data;
            } catch (error) {}
          }
        ),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await driverApi.createDriver(values, dispatch);

        toast.success("Driver created!");
        router.push("/dashboard/drivers");
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
              <Typography variant="h6">Basic details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <TextField
                    error={Boolean(formik.touched.name && formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    fullWidth
                    label="Driver name"
                    name="name"
                    onBlur={formik.handleBlur}
                    onChange={(event) => {
                      formik.setFieldValue(
                        "name",
                        event.target.value.replace(/\w\S*/g, function (txt) {
                          return (
                            txt.charAt(0).toUpperCase() +
                            txt.substr(1).toLowerCase()
                          );
                        })
                      );
                    }}
                    value={formik.values.name}
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.mobile && formik.errors.mobile
                    )}
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
                </Grid>
                <Grid item md={4} xs={12}>
                  <VehicleAutocomplete
                    errors={formik.errors}
                    touched={formik.touched}
                    setFieldValue={formik.setFieldValue}
                    handleBlur={formik.handleBlur}
                    account={account}
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
          justifyContent: "right",
          mx: -1,
          mb: -1,
          mt: 3,
        }}
      >
        <Button sx={{ m: 1 }} onClick={() => router.back()} variant="outlined">
          Cancel
        </Button>
        <Button sx={{ m: 1 }} type="submit" variant="contained">
          Create
        </Button>
      </Box>
    </form>
  );
});
