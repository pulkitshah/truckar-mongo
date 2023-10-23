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
import { invoiceFormats } from "../invoice/InvoicePDFs";
import { useDispatch } from "../../../store";
import { invoiceApi } from "../../../api/invoice-api";
import { deliveryApi } from "../../../api/delivery-api";
import TaxForm from "./tax-form";

export const InvoiceEditForm = ({
  deliveries,
  invoice = {},
  onCancel,
  gridApi,
}) => {
  const router = useRouter();
  const { account } = useAuth();
  const dispatch = useDispatch();
  const [invoiceFormat, setInvoiceFormat] = React.useState(
    invoice.invoiceFormat
  );
  const formik = useFormik({
    initialValues: {
      invoiceFormat: invoiceFormat,
      organisation: invoice.organisation || "",
      invoiceDate: moment(invoice.invoiceDate) || moment(),
      invoiceNo: invoice.invoiceNo || "",
      customer: invoice.customer || null,
      billingAddress: invoice.billingAddress || null,
      deliveries: deliveries || [],
      taxes: invoice.taxes ? invoice.taxes : [],
    },
    // validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      try {
        deliveries.map(async (delivery) => {
          if (!values.deliveries.find((e) => e._id === delivery._id)) {
            let updatedDelivery = {
              _id: delivery._id,
              invoice: null,
              particular: null,
              invoiceCharges: null,
              _version: delivery._version,
            };
            console.log(
              await deliveryApi.updateDelivery(updatedDelivery, dispatch)
            );
          }
        });

        let editedInvoice = {
          _id: invoice._id,
          organisation: values.organisation._id,
          invoiceNo: values.invoiceNo || "",
          invoiceDate: values.invoiceDate.format(),
          invoiceFormat: values.invoiceFormat,
          customer: values.customer._id,
          billingAddress: values.billingAddress._id,
          deliveries: values.deliveries,
          taxes: values.taxes,
          account: account._id,
          _version: invoice._version,
        };
        console.log(editedInvoice);

        await invoiceApi.updateInvoice(editedInvoice, dispatch);

        // editedInvoice.deliveries = values.deliveries.map(async (delivery) => {
        //   let updatedDelivery = {
        //     _id: delivery._id,
        //     invoice: invoice._id,
        //     particular: delivery.particular,
        //     invoiceCharges: delivery.extraCharges || [],
        //     _version: delivery._version,
        //   };

        //   console.log(
        //     await deliveryApi.updateDelivery(updatedDelivery, dispatch)
        //   );
        // });
        onCancel();

        gridApi.refreshInfiniteCache();
        toast.success("Invoice updated!");
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

  console.log(formik.values);
  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Box
          sx={{
            alignItems: "center",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
            borderRadius: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
            mb: 2,
          }}
        >
          <Typography variant="overline" sx={{ mr: 2 }} color="textSecondary">
            Invoice
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

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Typography sx={{ mb: 3 }} variant="h6">
                Invoice Format
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="invoiceFormat"
                    label="Invoice Format"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                    id="invoiceFormat"
                    select
                    value={invoiceFormat}
                    onChange={(event) => {
                      setInvoiceFormat(event.target.value);
                      formik.setFieldValue("invoiceFormat", event.target.value);
                    }}
                    SelectProps={{
                      native: true,
                    }}
                    variant="outlined"
                  >
                    {invoiceFormats.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Typography sx={{ mb: 3 }} variant="h6">
                Basic Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <OrganisationAutocomplete formik={formik} account={account} />
                </Grid>
                <Grid item xs={12}>
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
                <Grid item xs={12}>
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
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Typography sx={{ mb: 3 }} variant="h6">
                Party details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <PartyAutocomplete
                    errors={formik.errors}
                    touched={formik.touched}
                    setFieldValue={formik.setFieldValue}
                    handleBlur={formik.handleBlur}
                    type="customer"
                    formik={formik}
                  />
                </Grid>

                <Grid item xs={12}>
                  <AddressAutocomplete
                    type={"billingAddress"}
                    partyId={
                      formik.values.customer && formik.values.customer._id
                    }
                    formik={formik}
                  />
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {formik.values.customer && (
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <Typography variant="h6">Orders</Typography>
              <Box sx={{ mt: 3, px: 3, height: "30vh", width: "100%" }}>
                <OrderDetailsGrid formik={formik} />
              </Box>
            </Grid>
          </Grid>
        )}

        {formik.values.deliveries.length > 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6">Invoice Description</Typography>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <DeliveryDetails formik={formik} drawer={true} />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Typography sx={{ mb: 1 }} variant="h6">
                Taxes
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TaxForm formik={formik} />
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
          <Button sx={{ m: 1 }} variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
          <Button sx={{ m: 1 }} type="submit" variant="contained">
            Save Changes
          </Button>
        </Box>
      </form>
    </>
  );
};
