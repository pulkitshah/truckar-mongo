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
import { authApi } from "../../../api/auth-api";

export const AccountCreateForm = (props) => {
  const { user, initialize } = useAuth();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [lrFormat, setLrFormat] = React.useState("standardLoose");
  const [invoiceFormat, setInvoiceFormat] = React.useState(
    "standardTableFormat"
  );

  const formik = useFormik({
    initialValues: {
      name: "",
      orderExpensesSettings: [
        {
          id: uuidv4(),
          orderExpenseName: "Diesel",
          orderExpenseAmount: 0,
          isActive: true,
        },
        {
          id: uuidv4(),
          orderExpenseName: "Fooding",
          orderExpenseAmount: 0,
          isActive: true,
        },
        {
          id: uuidv4(),
          orderExpenseName: "Labour",
          orderExpenseAmount: 0,
          isActive: true,
        },
        {
          id: uuidv4(),
          orderExpenseName: "D.I",
          orderExpenseAmount: 0,
          isActive: true,
        },
        {
          id: uuidv4(),
          orderExpenseName: "Toll",
          orderExpenseAmount: 0,
          isActive: true,
        },
      ],
      lrSettings: [
        {
          lrFormatFileName: "standard-local",
          lrCharges: [
            {
              id: uuidv4(),
              chargeSrNo: 1,
              chargeName: "Hamali",
              chargeDefaultAmount: 0,
              isActive: true,
            },
            {
              id: uuidv4(),
              chargeSrNo: 2,
              chargeName: "Door Collection Charges",
              chargeDefaultAmount: 0,
              isActive: true,
            },
            {
              id: uuidv4(),
              chargeSrNo: 3,
              chargeName: "Door Delivery Charges",
              chargeDefaultAmount: 0,
              isActive: true,
            },
            {
              id: uuidv4(),
              chargeSrNo: 4,
              chargeName: "Statistical Charges",
              chargeDefaultAmount: 0,
              isActive: true,
            },
            {
              id: uuidv4(),
              chargeSrNo: 5,
              chargeName: "Misc Charges",
              chargeDefaultAmount: 0,
              isActive: true,
            },
            {
              id: uuidv4(),
              chargeSrNo: 6,
              chargeName: "I.C Charge",
              chargeDefaultAmount: 0,
              isActive: true,
            },
          ],
        },
      ],
      lrFormat: "standard-loose",
      invoiceFormat: "standardTableFormat",
      taxOptions: [
        {
          id: uuidv4(),
          name: "Output (C)GST",
          value: "9",
        },
        {
          id: uuidv4(),
          name: "Output (S)GST",
          value: "9",
        },
        {
          id: uuidv4(),
          name: "Output (I)GST",
          value: "18",
        },
      ],
    },
    onSubmit: async (values, helpers) => {
      try {
        let response = await accountApi.createAccount(values, dispatch);
        props.accountRef.current = response.data;

        await authApi.update({
          onBoardingRequired: false,
          accounts: [
            ...user.accounts,
            { account: response.data.id, role: "owner" },
          ],
        });

        props.handleNext();
        toast.success("Account created");
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
                <Typography variant="h6">{t("Account Name")}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {t("Please type your company / market name")}
                </Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <TextField
                  helperText={
                    formik.touched.name && formik.errors.name ? errorName : ""
                  }
                  error={Boolean(formik.touched.name && formik.errors.name)}
                  variant="outlined"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  id="name"
                  name="name"
                  label="Account Name"
                  fullWidth
                  value={formik.values.name}
                />

                <Box
                  sx={{ mt: 2 }}
                  p={2}
                  display="flex"
                  justifyContent="flex-end"
                >
                  <Button color="secondary" type="submit" variant="contained">
                    Next
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
