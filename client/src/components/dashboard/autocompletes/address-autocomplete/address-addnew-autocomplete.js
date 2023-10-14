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
import GooglePlaces from "../party-autocomplete/google-places-autocomplete";

import { addressApi } from "../../../../api/address-api";
import { useDispatch } from "../../../../store";
import { useAuth } from "../../../../hooks/use-auth";
const AddNewPartyAddressFromAutocomplete = ({
  open,
  dialogValue,
  setDialogValue,
  setFieldValue,
  toggleOpen,
  type,
  partyId,
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
        <DialogTitle _id="form-dialog-name">
          Add a new Address (Consignor/Consignee)
        </DialogTitle>
        <Formik
          initialValues={{
            name:
              dialogValue.name.replace(/\w\S*/g, function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              }) || "",
            gstin: dialogValue.gstin || "",
            pan: dialogValue.pan || "",
            billingAddressLine1: dialogValue.billingAddressLine1 || "",
            billingAddressLine2: dialogValue.billingAddressLine2 || "",
            city: dialogValue.location || "",
            party: partyId,
            account: account._id,
          }}
          onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
            try {
              console.log(values);
              const response = await addressApi.createAddress({
                values,
                dispatch,
              });
              toast.success("Address created!");
              setFieldValue(type, response.data);
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
                        label="Name"
                        name="name"
                        onBlur={handleBlur}
                        onChange={(event) => {
                          setFieldValue("name", event.target.value);
                        }}
                        required
                        value={values.name}
                        variant="outlined"
                      />
                      <TextField
                        margin="normal"
                        error={Boolean(touched.gstin && errors.gstin)}
                        fullWidth
                        helperText={touched.gstin && errors.gstin}
                        label="GSTIN"
                        name="gstin"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.gstin}
                        variant="outlined"
                      />
                      <TextField
                        margin="normal"
                        error={Boolean(touched.pan && errors.pan)}
                        fullWidth
                        helperText={touched.pan && errors.pan}
                        label="PAN"
                        name="pan"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.pan}
                        variant="outlined"
                      />
                      <TextField
                        margin="normal"
                        error={Boolean(
                          touched.billingAddressLine1 &&
                            errors.billingAddressLine1
                        )}
                        fullWidth
                        helperText={
                          touched.billingAddressLine1 &&
                          errors.billingAddressLine1
                        }
                        label="Billing Address Line 1"
                        name="billingAddressLine1"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.billingAddressLine1}
                        variant="outlined"
                      />
                      <TextField
                        margin="normal"
                        error={Boolean(
                          touched.billingAddressLine2 &&
                            errors.billingAddressLine2
                        )}
                        fullWidth
                        helperText={
                          touched.billingAddressLine2 &&
                          errors.billingAddressLine2
                        }
                        label="Billing Address Line 2"
                        name="billingAddressLine2"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        value={values.billingAddressLine2}
                        variant="outlined"
                        sx={{ paddingBottom: 2 }}
                      />
                      <GooglePlaces
                        error={Boolean(touched.mobile && errors.mobile)}
                        name={"City"}
                        field={"city"}
                        setFieldValue={setFieldValue}
                        handleBlur={handleBlur}
                        values={values}
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
                          Create Address
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
export default AddNewPartyAddressFromAutocomplete;
