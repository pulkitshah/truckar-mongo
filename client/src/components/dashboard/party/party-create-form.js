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
  Divider,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../../hooks/use-auth";
import { v4 as uuid } from "uuid";
import { partyApi } from "../../../api/party-api";
import { useDispatch } from "../../../store";
import GoogleMaps from "./google-places-autocomplete";

export const PartyCreateForm = (props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { account } = useAuth();
  const [mobile, setMobile] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      mobile: "",
      city: "",
      account: account,
      isTransporter: false,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string()
        .max(255)
        .required("Name is required")
        .test(
          "Unique Name",
          "A party already exists with this name", // <- key, message
          async function (value) {
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
        await partyApi.createParty({ values, dispatch });
        toast.success("Party created!");
        router.push("/dashboard/parties");
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
              <Typography variant="h6">Party details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    error={Boolean(formik.touched.name && formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                    fullWidth
                    label="Main contact name"
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
                    required
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
                <Grid item md={6} xs={12}>
                  <GoogleMaps
                    formik={formik}
                    error={Boolean(formik.touched.city && formik.errors.city)}
                    label={"City"}
                    field={"city"}
                    setFieldValue={formik.setFieldValue}
                    handleBlur={formik.handleBlur}
                    values={formik.values}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                  <Box
                    sx={{
                      alignItems: "center",
                      display: "flex",
                      justifyContent: "space-between",
                      m: 3,
                    }}
                  >
                    <div>
                      <Typography variant="subtitle1">
                        Is this party a transporter?
                      </Typography>
                      <Typography
                        color="textSecondary"
                        sx={{ mt: 1 }}
                        variant="body2"
                      >
                        Any party who is a transporter can be used for trading
                        and for purchases.
                      </Typography>
                    </div>
                    <Switch
                      checked={formik.values.isTransporter}
                      color="secondary"
                      edge="start"
                      name="isTransporter"
                      onChange={formik.handleChange}
                      value={formik.values.isTransporter}
                    />
                  </Box>
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
