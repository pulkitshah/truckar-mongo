import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useFormik, FormikProvider, FieldArray, getIn } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../hooks/use-auth";
import { Trash as TrashIcon } from "../../../icons/trash";
import { useDispatch } from "../../../store";

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Plus as PlusIcon } from "../../../icons/plus";
import { userApi } from "../../../api/user-api";

export const OrderExpensesSettings = (props) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      orderExpensesSettings: user.orderExpensesSettings || [
        {
          id: uuidv4(),
          orderExpenseName: "",
          orderExpenseAmount: 0,
          isActive: true,
        },
      ],
    },
    onSubmit: async (values, helpers) => {
      try {
        console.log(values.orderExpensesSettings),
          // await orderApi.createOrder(newOrder, dispatch);
          await userApi.updateUser(
            {
              id: user.id,
              orderExpensesSettings: JSON.stringify(
                values.orderExpensesSettings
              ),
              _version: user._version,
            },
            dispatch
          );
        toast.success("Order Expenses Settings updated!");
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
      <FormikProvider value={formik}>
        <FieldArray name="orderExpensesSettings" error={formik.errors}>
          {({ remove, push }) => (
            <Box sx={{ mt: 4 }} {...props}>
              <Card>
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                      <Typography variant="h6">
                        {t("Order Expenses Settings")}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {t(
                          "Non Billable Expenses incurred with the purpose of fulfilling the order "
                        )}
                      </Typography>
                    </Grid>
                    <Grid item md={8} xs={12}>
                      {formik.values.orderExpensesSettings.length > 0 &&
                        formik.values.orderExpensesSettings.map(
                          (delivery, index) => {
                            const orderExpensesName = `orderExpensesSettings[${index}]`;
                            const touchedOrderExpensesName = getIn(
                              formik.touched,
                              orderExpensesName
                            );
                            const errorOrderExpensesName = getIn(
                              formik.errors,
                              orderExpensesName
                            );

                            const orderExpenseAmount = `orderExpensesSettings[${index}].orderExpenseAmount`;
                            const touchedOrderExpenseAmount = getIn(
                              formik.touched,
                              orderExpenseAmount
                            );
                            const errorOrderExpenseAmount = getIn(
                              formik.errors,
                              orderExpenseAmount
                            );
                            return (
                              <React.Fragment>
                                <Grid container spacing={3}>
                                  {index > 0 && <Divider sx={{ mb: 2 }} />}
                                  <Grid
                                    item
                                    xs={6}
                                    sx={{ mt: 2 }}
                                    className="col"
                                    key={index}
                                  >
                                    <TextField
                                      helperText={
                                        touchedOrderExpensesName &&
                                        errorOrderExpensesName
                                          ? errorOrderExpensesName
                                          : ""
                                      }
                                      error={Boolean(
                                        touchedOrderExpensesName &&
                                          errorOrderExpensesName
                                      )}
                                      variant="outlined"
                                      onChange={(event) => {
                                        formik.setFieldValue(
                                          `orderExpensesSettings[${index}].orderExpensesName`,
                                          event.target.value
                                        );
                                      }}
                                      onBlur={formik.handleBlur}
                                      id="orderExpensesName"
                                      name="orderExpensesName"
                                      label="Expense Name"
                                      fullWidth
                                      value={
                                        formik.values.orderExpensesSettings[
                                          index
                                        ].orderExpenseName
                                      }
                                    />
                                  </Grid>
                                  <Grid
                                    item
                                    xs={4}
                                    sx={{ mt: 2 }}
                                    className="col"
                                  >
                                    <TextField
                                      value={
                                        formik.values.orderExpensesSettings[
                                          index
                                        ].orderExpenseAmount
                                      }
                                      variant="outlined"
                                      onChange={formik.handleChange}
                                      onBlur={formik.handleBlur}
                                      id={orderExpenseAmount}
                                      name={orderExpenseAmount}
                                      helperText={
                                        touchedOrderExpenseAmount &&
                                        errorOrderExpenseAmount
                                          ? errorOrderExpenseAmount
                                          : ""
                                      }
                                      error={Boolean(
                                        touchedOrderExpenseAmount &&
                                          errorOrderExpenseAmount
                                      )}
                                      label="Default Amount"
                                      fullWidth
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
                          }
                        )}

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
                              orderExpenseName: "",
                              orderExpenseAmount: 0,
                              isActive: true,
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
                          Save Changes
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
