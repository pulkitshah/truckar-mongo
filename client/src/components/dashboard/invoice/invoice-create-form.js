import React, { useState } from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import moment from "moment";

import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAuth } from "../../../hooks/use-auth";
import PartyAutocomplete from "../autocompletes/party-autocomplete/party-autocomplete";
import AddressAutocomplete from "../autocompletes/address-autocomplete/address-autocomplete";
import OrganisationAutocomplete from "../autocompletes/organisation-autcomplete/organisation-autocomplete";
import OrderDetailsGrid from "./order-details-ag-grid";
import DeliveryDetails from "./delivery-details";
import { useDispatch } from "../../../store";
import { invoiceApi } from "../../../api/invoice-api";
import { deliveryApi } from "../../../api/delivery-api";

export const InvoiceCreateForm = ({ invoice = {} }) => {
  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      organisation: invoice.organisation || "",
      invoiceDate: invoice.invoiceDate || moment(),
      invoiceNo: invoice.invoiceNo || "",
      customer: invoice.customer || null,
      deliveries: invoice.deliveries || [],
    },
    // validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      try {
        console.log(values);
        let newInvoice = {
          organisationId: values.organisation.id,
          invoiceNo: values.invoiceNo || "",
          invoiceDate: values.invoiceDate.format(),
          customerId: values.customer.id,
          billingAddressId: values.billingAddress.id,
          invoiceFormat: user.invoiceFormat,
          user: user.id,
        };
        let invoice = await invoiceApi.createInvoice(newInvoice, dispatch);
        console.log(invoice);
        newInvoice.deliveries = JSON.stringify(
          values.deliveries.map(async (delivery) => {
            let updatedDelivery = {
              id: delivery.id,
              invoiceId: invoice.id,
              particular: delivery.particular,
              invoiceCharges: JSON.stringify(delivery.extraCharges || []),
              _version: delivery._version,
            };

            console.log(updatedDelivery);

            console.log(
              await deliveryApi.updateDelivery(updatedDelivery, dispatch)
            );
          })
        );

        toast.success("Invoice created!");
        router.push("/dashboard/invoices");
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
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Basic details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <OrganisationAutocomplete formik={formik} user={user} />
                </Grid>
                <Grid item md={4} xs={12}>
                  <DatePicker
                    id="invoiceDate"
                    name="invoiceDate"
                    label="Invoice date"
                    showTodayButton={true}
                    inputFormat="DD/MM/YYYY"
                    value={formik.values.invoiceDate}
                    onClick={() => setFieldTouched("end")}
                    onChange={(date) =>
                      formik.setFieldValue("invoiceDate", moment(date))
                    }
                    slotProps={{
                      textField: {
                        helperText:
                          formik.touched.invoiceDate &&
                          formik.errors.invoiceDate,
                        error: Boolean(
                          formik.touched.invoiceDate &&
                            formik.errors.invoiceDate
                        ),
                      },
                    }}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.invoiceNo && formik.errors.invoiceNo
                    )}
                    fullWidth
                    helperText={
                      formik.touched.invoiceNo && formik.errors.invoiceNo
                    }
                    label="Invoice No"
                    name="invoiceNo"
                    onBlur={formik.handleBlur}
                    onChange={(event) => {
                      formik.setFieldValue(`invoiceNo`, event.target.value);
                    }}
                    value={formik.values.invoiceNo}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid sx={{ mb: 6 }} item md={4} xs={12}>
              <Typography sx={{ mb: 3 }} variant="h6">
                Party details
              </Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <PartyAutocomplete
                    errors={formik.errors}
                    touched={formik.touched}
                    setFieldValue={formik.setFieldValue}
                    handleBlur={formik.handleBlur}
                    type="customer"
                    user={user}
                    formik={formik}
                  />
                </Grid>

                <Grid item md={4} xs={12}>
                  <AddressAutocomplete
                    type={"billingAddress"}
                    partyId={
                      formik.values.customer && formik.values.customer.id
                    }
                    user={user}
                    formik={formik}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {formik.values.customer && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6">Orders</Typography>
                <Box sx={{ mt: 3, px: 3, height: "30vh", width: "100%" }}>
                  <OrderDetailsGrid formik={formik} />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {formik.values.deliveries.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6">Invoice Description</Typography>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <DeliveryDetails formik={formik} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

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
