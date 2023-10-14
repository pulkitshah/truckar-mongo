/* eslint-disable no-use-before-define */
import React, { useState, useEffect, useCallback } from "react";
import { Formik } from "formik";
import toast from "react-hot-toast";
import { v4 as uuid } from "uuid";
import * as Yup from "yup";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import GooglePlaces from "./google-places-autocomplete";
import { partyApi } from "../../../../api/party-api";
import { useDispatch } from "../../../../store";
import { useAuth } from "../../../../hooks/use-auth";
const AddNewPartyFromAutocomplete = ({
  open,
  dialogValue,
  setDialogValue,
  setFieldValue,
  toggleOpen,
  type,
  ...rest
}) => {
  const dispatch = useDispatch();
  const { account } = useAuth();
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={() => toggleOpen(false)}
        aria-labelledby="form-dialog-name"
      >
        <DialogTitle id="form-dialog-name">Add a new party</DialogTitle>
        <Formik
          initialValues={{
            name:
              dialogValue.name.replace(/\w\S*/g, function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              }) || "",
            mobile: dialogValue.mobile || "",
            city: dialogValue.location || "",
            isTransporter: type === "transporter" ? true : false,
            account: account,
          }}
          validationSchema={Yup.object().shape({
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
          })}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              setSubmitting(true);
              const response = await partyApi.createParty({ values, dispatch });
              toast.success("Party created!");
              setFieldValue(type, response);
              toggleOpen(false);
            } catch (err) {
              console.log(err);
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }}
        >
          {({
            errors,
            handleBlur,
            handleChange,
            handleSubmit,
            isSubmitting,
            setFieldValue,
            touched,
            values,
          }) => (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        error={Boolean(touched.name && errors.name)}
                        fullWidth
                        helperText={touched.name && errors.name}
                        label="Main Contact Name"
                        name="name"
                        onBlur={handleBlur}
                        onChange={(event) => {
                          setFieldValue("name", event.target.value);
                        }}
                        required
                        value={values.name}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        error={Boolean(touched.mobile && errors.mobile)}
                        fullWidth
                        helperText={touched.mobile && errors.mobile}
                        label="Mobile"
                        name="mobile"
                        onBlur={handleBlur}
                        onChange={(event) => {
                          setFieldValue(
                            "mobile",
                            event.target.value.replace(/ /g, "")
                          );
                        }}
                        value={values.mobile}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <GooglePlaces
                        error={Boolean(touched.mobile && errors.mobile)}
                        name={"City"}
                        field={"city"}
                        setFieldValue={setFieldValue}
                        handleBlur={handleBlur}
                        values={values}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h5" color="textPrimary">
                        Party Type
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Is this party a transporter?
                      </Typography>
                      <Switch
                        checked={values.isTransporter}
                        color="secondary"
                        edge="start"
                        name="isTransporter"
                        onChange={handleChange}
                        value={values.isTransporter}
                        disabled={type === "transporter"}
                      />
                    </Grid>
                  </Grid>
                  <Box mt={2}>
                    <Grid container spacing={3}>
                      <Grid item>
                        <Button
                          variant="contained"
                          color="secondary"
                          type="submit"
                          disabled={isSubmitting}
                        >
                          Create Party
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => toggleOpen(false)}
                        >
                          Cancel
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </form>
          )}
        </Formik>
      </Dialog>
    </React.Fragment>
  );
};
export default AddNewPartyFromAutocomplete;
