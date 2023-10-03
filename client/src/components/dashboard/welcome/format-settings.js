import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useFormik, FormikProvider, FieldArray, getIn } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import { Trash as TrashIcon } from "../../../icons/trash";
import { Plus as PlusIcon } from "../../../icons/plus";
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
import { userApi } from "../../../api/user-api";
import { lrFormats } from "../lr/LrPDFs";
import { invoiceFormats } from "../invoice/InvoicePDFs";
import { accountApi } from "../../../api/account-api";

export const FormatSettings = (props) => {
  const { user, initialize } = useAuth();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [lrFormat, setLrFormat] = React.useState("standardLoose");
  const [invoiceFormat, setInvoiceFormat] = React.useState(
    "standardTableFormat"
  );

  const formik = useFormik({
    initialValues: {
      lrFormat: lrFormat,
      invoiceFormat: invoiceFormat,
    },
    onSubmit: async (values, helpers) => {
      try {
        // await orderApi.createOrder(newOrder, dispatch);
        await accountApi.updateAccount(
          {
            id: props.accountRef.current.id,
            lrFormat: values.lrFormat,
            invoiceFormat: values.invoiceFormat,
          },
          dispatch
        );

        props.handleNext();
        toast.success("Format settings updated!");
        // router.push("/dashboard/orders");
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
      <Box sx={{ mt: 4 }} {...props}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography variant="h6">{t("Format Settings")}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {t("These are the default formats for documents created.")}
                </Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <TextField
                  sx={{ mb: 2 }}
                  name="lrFormat"
                  label="LR Format"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  fullWidth
                  id="lrFormat"
                  select
                  value={lrFormat}
                  onChange={(event) => {
                    setLrFormat(event.target.value);
                    event.target.value;
                    formik.setFieldValue("lrFormat", event.target.value);
                  }}
                  SelectProps={{
                    native: true,
                  }}
                  variant="outlined"
                >
                  {lrFormats.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>

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
                    setLrFormat(event.target.value);
                    event.target.value;
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

                <Box
                  sx={{ mt: 2 }}
                  p={2}
                  display="flex"
                  justifyContent="flex-end"
                >
                  <Button color="secondary" type="submit" variant="contained">
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </form>
  );
};
