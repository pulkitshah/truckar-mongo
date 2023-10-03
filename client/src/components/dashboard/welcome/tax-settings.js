import React, { useRef, useState } from "react";
import { useRouter } from "next/router";
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
import { accountApi } from "../../../api/account-api";

export const TaxSettings = (props) => {
  const { user, initialize } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const formik = useFormik({
    initialValues: {
      taxOptions: user.taxOptions || [
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
    // validationSchema: Yup.object().shape({
    //   name: Yup.string().max(255).required("Name is required"),
    //   value: Yup.string().max(255).required("Name is required"),
    // }),
    onSubmit: async (values, helpers) => {
      try {
        await accountApi.updateAccount(
          {
            id: props.accountRef.current.id,
            taxOptions: values.taxOptions,
          },
          dispatch
        );

        // props.handleNext();
        await initialize();
        toast.success("Tax settings updated!");
        router.push("/dashboard/orders");
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
      <FormikProvider value={formik}>
        <FieldArray name="taxOptions" error={formik.errors}>
          {({ remove, push }) => (
            <Box sx={{ mt: 4 }} {...props}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <Typography variant="h6">{t("Taxes")}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t(
                          "These taxes will be available to be used in invoices"
                        )}
                      </Typography>
                    </Grid>
                    <Grid item md={8} xs={12}>
                      {formik.values.taxOptions.length > 0 &&
                        formik.values.taxOptions.map((delivery, index) => {
                          const name = `taxOptions[${index}]`;
                          const touchedName = getIn(formik.touched, name);
                          const errorName = getIn(formik.errors, name);

                          const value = `taxOptions[${index}]`;
                          const touchedValue = getIn(formik.touched, value);
                          const errorValue = getIn(formik.errors, value);

                          return (
                            <React.Fragment>
                              <Grid container spacing={3} key={index}>
                                {index > 0 && <Divider sx={{ mb: 2 }} />}
                                <Grid
                                  item
                                  xs={12}
                                  md={5}
                                  sx={{ mt: 2 }}
                                  className="col"
                                >
                                  <TextField
                                    helperText={
                                      touchedName && errorName ? errorName : ""
                                    }
                                    error={Boolean(touchedName && errorName)}
                                    variant="outlined"
                                    onChange={(event) => {
                                      formik.setFieldValue(
                                        `taxOptions[${index}].name`,
                                        event.target.value
                                      );
                                    }}
                                    onBlur={formik.handleBlur}
                                    id="name"
                                    name="name"
                                    label="Tax Name"
                                    fullWidth
                                    value={formik.values.taxOptions[index].name}
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={12}
                                  md={5}
                                  sx={{ mt: 2 }}
                                  className="col"
                                >
                                  <TextField
                                    type="number"
                                    helperText={
                                      touchedValue && errorValue
                                        ? errorValue
                                        : ""
                                    }
                                    error={Boolean(touchedValue && errorValue)}
                                    variant="outlined"
                                    onChange={(event) => {
                                      formik.setFieldValue(
                                        `taxOptions[${index}].value`,
                                        event.target.value
                                      );
                                    }}
                                    onBlur={formik.handleBlur}
                                    id="value"
                                    name="value"
                                    label="Tax Value"
                                    fullWidth
                                    value={
                                      formik.values.taxOptions[index].value
                                    }
                                  />
                                </Grid>
                                <Grid item sx={{ mt: 3 }} className="col">
                                  <Button
                                    disabled={index < 1}
                                    color="error"
                                    onClick={() => {
                                      remove(index);
                                    }}
                                  >
                                    <TrashIcon fontSize="small" />
                                  </Button>
                                </Grid>
                              </Grid>
                            </React.Fragment>
                          );
                        })}

                      <Box
                        sx={{ mt: 2 }}
                        p={2}
                        display="flex"
                        justifyContent="flex-end"
                      >
                        <Button
                          sx={{ mr: 2 }}
                          variant="contained"
                          color="secondary"
                          startIcon={<PlusIcon fontSize="small" />}
                          onClick={() => {
                            push({
                              id: uuidv4(),
                              name: "",
                              value: "",
                            });
                          }}
                        >
                          Add Expense
                        </Button>
                        <Button
                          color="secondary"
                          type="submit"
                          variant="contained"
                        >
                          Save and Finish
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </FieldArray>
      </FormikProvider>
    </form>
  );
};
