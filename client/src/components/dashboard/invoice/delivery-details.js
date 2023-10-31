import React from "react";
import { v4 as uuidv4 } from "uuid";
import { FormikProvider, FieldArray, getIn } from "formik";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Divider,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { DistanceMatrixService } from "@react-google-maps/api";
import { Trash as TrashIcon } from "../../../icons/trash";
import { Plus as PlusIcon } from "../../../icons/plus";
import GoogleMaps from "../order/google-places-autocomplete";
import { display } from "@mui/system";
import moment from "moment";
import {
  calculateAmountForDelivery,
  dataFormatter,
} from "../../../utils/amount-calculation";

const DeliveryDetails = ({ sx, formik, drawer = false }) => {
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));
  return (
    <React.Fragment>
      <FormikProvider value={formik}>
        <FieldArray name="deliveries" error={formik.errors}>
          {() => (
            <React.Fragment>
              {formik.values.deliveries.length > 0 &&
                formik.values.deliveries.map((delivery, index) => {
                  const particular = `deliveries[${index}].particular`;
                  const touchedParticular = getIn(formik.touched, particular);
                  const errorParticular = getIn(formik.errors, particular);

                  return (
                    <React.Fragment>
                      {index > 0 && <Divider sx={{ mb: 2 }} />}
                      <Card sx={{ mt: 3 }} variant="outlined" key={index}>
                        <CardContent>
                          <Grid
                            container
                            spacing={1}
                            className="row"
                            key={delivery.id}
                            justifyContent={"space-between"}
                            sx={{ mb: 2 }}
                          >
                            <Grid item xs={12} className="col">
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Box>
                                  <Typography variant="body2">
                                    Order No
                                  </Typography>
                                  <Typography sx={{ mb: 3 }} variant="body2">
                                    {formik.values.deliveries[index]?.orderNo}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body2">LR No</Typography>
                                  <Typography sx={{ mb: 3 }} variant="body2">
                                    {Object.keys(
                                      formik.values.deliveries[index].delivery
                                        .lr
                                    ).length
                                      ? `${formik.values.deliveries[index].delivery.lr.organisation.initials} - ${formik.values.deliveries[index].delivery.lr.lrNo}`
                                      : "N/A"}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="body2">
                                    Sale Date
                                  </Typography>
                                  <Typography sx={{ mb: 3 }} variant="body2">
                                    {moment(
                                      formik.values.deliveries[index].order
                                        ?.saleDate
                                    ).format("DD/MM/YYYY")}
                                  </Typography>
                                </Box>
                                {!mdDown && (
                                  <React.Fragment>
                                    <Box>
                                      <Typography variant="body2">
                                        From
                                      </Typography>
                                      <Typography
                                        sx={{ mb: 3 }}
                                        variant="body2"
                                      >
                                        {
                                          formik.values.deliveries[index]
                                            .delivery.loading
                                            .structured_formatting.main_text
                                        }
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="body2">
                                        To
                                      </Typography>
                                      <Typography
                                        sx={{ mb: 3 }}
                                        variant="body2"
                                      >
                                        {
                                          formik.values.deliveries[index]
                                            .delivery.unloading
                                            .structured_formatting.main_text
                                        }
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="body2">
                                        Bill Quantity
                                      </Typography>
                                      <Typography
                                        sx={{ mb: 3 }}
                                        variant="body2"
                                      >
                                        {formik.values.deliveries[index]
                                          .delivery.billQuantity
                                          ? `${formik.values.deliveries[index].delivery.billQuantity} ${formik.values.deliveries[index].saleType.unit}`
                                          : "N/A"}
                                      </Typography>
                                    </Box>
                                    {!drawer && (
                                      <Box>
                                        <Button
                                          variant="contained"
                                          color="secondary"
                                          startIcon={
                                            <PlusIcon fontSize="small" />
                                          }
                                          onClick={() => {
                                            formik.setFieldValue(
                                              `deliveries[${index}].invoiceCharges`,
                                              [
                                                ...(formik.values.deliveries[
                                                  index
                                                ].invoiceCharges || []),
                                                {
                                                  id: uuidv4(),
                                                  particular: "",
                                                  amount: "",
                                                },
                                              ]
                                            );
                                          }}
                                        >
                                          Add Extra Charge
                                        </Button>
                                      </Box>
                                    )}
                                  </React.Fragment>
                                )}
                              </Box>
                            </Grid>
                            {mdDown && (
                              <Grid item xs={12} className="col">
                                <React.Fragment>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Box>
                                      <Typography variant="body2">
                                        From
                                      </Typography>
                                      <Typography
                                        sx={{ mb: 3 }}
                                        variant="body2"
                                      >
                                        {
                                          formik.values.deliveries[index]
                                            .delivery.loading
                                            .structured_formatting.main_text
                                        }
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="body2">
                                        To
                                      </Typography>
                                      <Typography
                                        sx={{ mb: 3 }}
                                        variant="body2"
                                      >
                                        {
                                          formik.values.deliveries[index]
                                            .delivery.unloading
                                            .structured_formatting.main_text
                                        }
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="body2">
                                        Bill Quantity
                                      </Typography>
                                      <Typography
                                        sx={{ mb: 3 }}
                                        variant="body2"
                                      >
                                        {formik.values.deliveries[index]
                                          .delivery.billQuantity
                                          ? `${formik.values.deliveries[index].delivery.billQuantity} ${formik.values.deliveries[index].saleType.unit}`
                                          : "N/A"}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </React.Fragment>
                              </Grid>
                            )}
                            {drawer && (
                              <Box sx={{ mb: 3 }}>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  startIcon={<PlusIcon fontSize="small" />}
                                  onClick={() => {
                                    formik.setFieldValue(
                                      `deliveries[${index}].invoiceCharges`,
                                      [
                                        ...(formik.values.deliveries[index]
                                          .invoiceCharges || []),
                                        {
                                          id: uuidv4(),
                                          particular: "",
                                          amount: "",
                                        },
                                      ]
                                    );
                                  }}
                                >
                                  Add Extra Charge
                                </Button>
                              </Box>
                            )}
                            <Grid
                              container
                              spacing={1}
                              alignItems="center"
                              sx={{ mb: 2 }}
                            >
                              <Grid
                                item
                                sx={{ mb: 1 }}
                                md={drawer ? 8.5 : 10}
                                xs={12}
                                className="col"
                              >
                                {console.log(
                                  "formik.values.deliveries[index].particular"
                                )}
                                {console.log(
                                  formik.values.deliveries[index].particular
                                )}
                                <TextField
                                  helperText={
                                    touchedParticular && errorParticular
                                      ? errorParticular
                                      : ""
                                  }
                                  error={Boolean(
                                    touchedParticular && errorParticular
                                  )}
                                  variant="outlined"
                                  onChange={(event) => {
                                    formik.setFieldValue(
                                      `deliveries[${index}].particular`,
                                      event.target.value
                                    );
                                  }}
                                  onBlur={formik.handleBlur}
                                  id="particular"
                                  name="particular"
                                  label="Particulars"
                                  fullWidth
                                  value={
                                    formik.values.deliveries[index].particular
                                      ? formik.values.deliveries[index]
                                          .particular
                                      : ""
                                  }
                                />
                              </Grid>

                              <Grid
                                item
                                sx={{ mb: 1 }}
                                md={drawer ? 3 : 1.5}
                                xs={12}
                                className="col"
                              >
                                <TextField
                                  disabled={true}
                                  variant="outlined"
                                  onBlur={formik.handleBlur}
                                  id="amount"
                                  name="amount"
                                  label="Amount"
                                  fullWidth
                                  value={dataFormatter(
                                    calculateAmountForDelivery(
                                      formik.values.deliveries[index],
                                      "sale"
                                    ),
                                    "currency"
                                  )}
                                />
                              </Grid>

                              {formik.values.deliveries[index].invoiceCharges &&
                                formik.values.deliveries[
                                  index
                                ].invoiceCharges.map(
                                  (extraCharge, indexExtraCharge) => {
                                    return (
                                      <React.Fragment>
                                        <Grid
                                          item
                                          md={drawer ? 8.5 : 10}
                                          xs={12}
                                          className="col"
                                          key={indexExtraCharge}
                                        >
                                          <TextField
                                            helperText={
                                              touchedParticular &&
                                              errorParticular
                                                ? errorParticular
                                                : ""
                                            }
                                            error={Boolean(
                                              touchedParticular &&
                                                errorParticular
                                            )}
                                            variant="outlined"
                                            onChange={(event) => {
                                              formik.setFieldValue(
                                                `deliveries[${index}].invoiceCharges[${indexExtraCharge}].particular`,
                                                event.target.value
                                              );
                                            }}
                                            onBlur={formik.handleBlur}
                                            id="particular"
                                            name="particular"
                                            label="Particulars (Extra)"
                                            fullWidth
                                            value={
                                              formik.values.deliveries[index]
                                                .invoiceCharges[
                                                indexExtraCharge
                                              ].particular
                                            }
                                          />
                                        </Grid>

                                        <Grid
                                          item
                                          md={drawer ? 3 : 1.5}
                                          xs={12}
                                          className="col"
                                        >
                                          <TextField
                                            variant="outlined"
                                            onChange={(event) => {
                                              formik.setFieldValue(
                                                `deliveries[${index}].invoiceCharges[${indexExtraCharge}].amount`,
                                                parseFloat(event.target.value)
                                              );
                                            }}
                                            onBlur={formik.handleBlur}
                                            id="amount"
                                            name="amount"
                                            label="Amount"
                                            fullWidth
                                            value={
                                              formik.values.deliveries[index]
                                                .invoiceCharges[
                                                indexExtraCharge
                                              ].amount
                                            }
                                          />
                                        </Grid>
                                        <Grid
                                          item
                                          md={0.5}
                                          xs={12}
                                          className="col"
                                        >
                                          <Button
                                            color="secondary"
                                            startIcon={
                                              <TrashIcon fontSize="small" />
                                            }
                                            onClick={(event) => {
                                              console.log(
                                                formik.values.deliveries[index]
                                                  .invoiceCharges[
                                                  indexExtraCharge
                                                ]
                                              );

                                              let x = formik.values.deliveries[
                                                index
                                              ].invoiceCharges.filter(
                                                (extraCharge) => {
                                                  if (
                                                    extraCharge.id ===
                                                    formik.values.deliveries[
                                                      index
                                                    ].invoiceCharges[
                                                      indexExtraCharge
                                                    ].id
                                                  ) {
                                                    return false;
                                                  }
                                                  return true;
                                                }
                                              );
                                              formik.setFieldValue(
                                                `deliveries[${index}].invoiceCharges`,
                                                x
                                              );
                                            }}
                                          />
                                        </Grid>
                                      </React.Fragment>
                                    );
                                  }
                                )}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </React.Fragment>
                  );
                })}
            </React.Fragment>
          )}
        </FieldArray>
      </FormikProvider>
    </React.Fragment>
  );
};

export default DeliveryDetails;
