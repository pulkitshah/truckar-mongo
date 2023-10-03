import { forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import { v4 as uuid } from "uuid";
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
import GoogleMaps from "../driver/google-places-autocomplete";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import { driverApi } from "../../../api/driver-api";
import { userApi } from "../../../api/user-api";

export const DriverCreateForm = forwardRef(({ handleNext, ...props }, ref) => {
  const { user } = useAuth();
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
      city: "",
      driverType: "main",
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .max(255)
        .required("Name is required")
        .test(
          "Unique Name",
          "A party already exists with this name", // <- key, message
          async function (value) {
            try {
              const response = await driverApi.validateDuplicateName(
                value,
                user
              );
              return response;
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
                value,
                user
              );
              return response;
            } catch (error) {}
          }
        ),
    }),
    onSubmit: async (values, helpers) => {
      try {
        const id = uuid();
        const newDriver = {
          id: id,
          name: values.name,
          mobile: values.mobile,
          user: user.id,
        };
        await driverApi.createDriver(newDriver, dispatch);

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
                <Grid item md={6} xs={12}>
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
                <Grid item md={6} xs={12}>
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
        <Button sx={{ m: 1 }} variant="outlined">
          Cancel
        </Button>
        <Button sx={{ m: 1 }} type="submit" variant="contained">
          Create
        </Button>
      </Box>
    </form>
  );
});
