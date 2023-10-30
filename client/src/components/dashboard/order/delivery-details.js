import React from "react";
import { v4 as uuidv4 } from "uuid";
import { FormikProvider, FieldArray, getIn } from "formik";
import {
  Grid,
  Typography,
  Button,
  Divider,
  InputAdornment,
  TextField,
} from "@mui/material";
import { DistanceMatrixService } from "@react-google-maps/api";
import { Trash as TrashIcon } from "../../../icons/trash";
import { Plus as PlusIcon } from "../../../icons/plus";
import GoogleMaps from "./google-places-autocomplete";

const DeliveryForm = ({ sx, formik, ...rest }) => {
  const [noOfDeliveries, setNoOfDeliveries] = React.useState(1);
  const [googleResponse, setResponse] = React.useState([]);

  let distanceCallback = (response) => {
    if (response !== null) {
      if (response.rows[0].elements[0].status === "OK") {
        const index = googleResponse.findIndex(
          (obj) =>
            obj.origin === response.originAddresses[0] &&
            obj.destination === response.destinationAddresses[0]
        );
        if (index < 0) {
          console.log(response);
          setResponse([
            ...googleResponse,
            {
              origin: response.originAddresses[0],
              destination: response.destinationAddresses[0],
              distance: response.rows[0].elements[0].distance.text,
              duration: response.rows[0].elements[0].duration.text,
            },
          ]);
        }
      }
    }
  };

  let getDistance = (origin, destination) => {
    let object = googleResponse.find(
      (obj) => obj.origin === origin && obj.destination === destination
    );
    if (object) return object.distance;
  };

  return (
    <React.Fragment>
      <FormikProvider value={formik}>
        <FieldArray name="deliveries" error={formik.errors}>
          {({ remove, push }) => (
            <React.Fragment>
              <Grid
                container
                spacing={3}
                justifyContent="space-between"
                alignItems={"center"}
                sx={{ mb: 3, ...sx }}
              >
                <Grid item>
                  <Typography variant="h6">
                    Total Deliveries: {noOfDeliveries}
                  </Typography>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<PlusIcon fontSize="small" />}
                    onClick={() => {
                      setNoOfDeliveries(noOfDeliveries + 1);
                      push({
                        _id: uuidv4(),
                        loading: {},
                        unloading: {},
                        billQuantity: "",
                        unloadingQuantity: "",
                      });
                    }}
                  >
                    Add Delivery
                  </Button>
                </Grid>
              </Grid>

              {formik.values.deliveries.length > 0 &&
                formik.values.deliveries.map((delivery, index) => {
                  const loading = `deliveries[${index}].loading`;
                  const touchedLoading = getIn(formik.touched, loading);
                  const errorLoading = getIn(formik.errors, loading);

                  const unloading = `deliveries[${index}].unloading`;
                  const touchedUnloading = getIn(formik.touched, unloading);
                  const errorUnloading = getIn(formik.errors, unloading);

                  const billQuantity = `deliveries[${index}].billQuantity`;
                  const touchedBillQuantity = getIn(
                    formik.touched,
                    billQuantity
                  );
                  const errorBillQuantity = getIn(formik.errors, billQuantity);

                  const unloadingQuantity = `deliveries[${index}].unloadingQuantity`;
                  const touchedUnloadingQuantity = getIn(
                    formik.touched,
                    unloadingQuantity
                  );
                  const errorUnloadingQuantity = getIn(
                    formik.errors,
                    unloadingQuantity
                  );
                  return (
                    <React.Fragment>
                      {index > 0 && <Divider sx={{ mb: 2 }} />}

                      <Grid
                        container
                        spacing={1}
                        className="row"
                        key={index}
                        alignItems={"center"}
                        sx={{ mb: 2 }}
                      >
                        <Grid item md={5} xs={12} className="col" key={index}>
                          <GoogleMaps
                            label={"Loading"}
                            error={errorLoading}
                            touched={touchedLoading}
                            name={loading}
                            setFieldValue={formik.setFieldValue}
                            handleBlur={formik.handleBlur}
                            values={formik.values}
                            index={index}
                            type="loading"
                            formik={formik}
                          />
                        </Grid>
                        <Grid item md={5} xs={12} className="col">
                          <GoogleMaps
                            label={"Unloading"}
                            error={errorUnloading}
                            touched={touchedUnloading}
                            name={loading}
                            setFieldValue={formik.setFieldValue}
                            handleBlur={formik.handleBlur}
                            values={formik.values}
                            index={index}
                            type="unloading"
                            formik={formik}
                          />
                        </Grid>
                        <Grid item className="col">
                          <Button
                            disabled={index < 1}
                            color="error"
                            onClick={() => {
                              setNoOfDeliveries(noOfDeliveries - 1);
                              remove(index);
                            }}
                          >
                            <TrashIcon fontSize="small" />
                          </Button>
                        </Grid>
                      </Grid>
                      <Grid
                        container
                        spacing={1}
                        className="row"
                        key={index + 1}
                        alignItems={"center"}
                        sx={{ mb: 2 }}
                      >
                        <Grid item md={5} xs={12} className="col" key={index}>
                          <TextField
                            helperText={
                              touchedBillQuantity && errorBillQuantity
                                ? errorBillQuantity
                                : ""
                            }
                            error={Boolean(
                              touchedBillQuantity && errorBillQuantity
                            )}
                            variant="outlined"
                            onChange={(event) => {
                              formik.setFieldValue(
                                `deliveries[${index}].billQuantity`,
                                event.target.value
                              );
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  {`${formik.values.saleType.unit}`}
                                </InputAdornment>
                              ),
                            }}
                            onBlur={formik.handleBlur}
                            id="billQuantity"
                            name="billQuantity"
                            label="Bill Quantity"
                            fullWidth
                            value={formik.values.deliveries[index].billQuantity}
                          />
                        </Grid>
                        <Grid item md={5} xs={12} className="col">
                          <TextField
                            helperText={
                              touchedUnloadingQuantity && errorUnloadingQuantity
                                ? errorUnloadingQuantity
                                : ""
                            }
                            error={Boolean(
                              touchedUnloadingQuantity && errorUnloadingQuantity
                            )}
                            variant="outlined"
                            onChange={(event) => {
                              formik.setFieldValue(
                                `deliveries[${index}].unloadingQuantity`,
                                event.target.value
                              );
                            }}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  {`${formik.values.saleType.unit}`}
                                </InputAdornment>
                              ),
                            }}
                            onBlur={formik.handleBlur}
                            id="unloadingQuantity"
                            name="unloadingQuantity"
                            label="Unloading Quantity"
                            fullWidth
                            value={
                              formik.values.deliveries[index].unloadingQuantity
                            }
                          />
                        </Grid>
                      </Grid>
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

export default DeliveryForm;
