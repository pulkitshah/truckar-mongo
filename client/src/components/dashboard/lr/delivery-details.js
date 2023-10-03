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
import GoogleMaps from "./google-places-autocomplete";
import AddressAutocomplete from "../autocompletes/address-autocomplete/address-autocomplete";

const DeliveryForm = ({ sx, formik, order, user, ...rest }) => {
  const [noOfDeliveries, setNoOfDeliveries] = React.useState(1);
  const [googleResponse, setResponse] = React.useState([]);

  return (
    <React.Fragment>
      <FormikProvider value={formik}>
        <FieldArray name="deliveryDetails" error={formik.errors}>
          {() => (
            <React.Fragment>
              {formik.values.deliveryDetails.length > 0 &&
                formik.values.deliveryDetails.map((delivery, index) => {
                  const loading = `deliveryDetails[${index}].loading`;
                  const touchedLoading = getIn(formik.touched, loading);
                  const errorLoading = getIn(formik.errors, loading);

                  const unloading = `deliveryDetails[${index}].unloading`;
                  const touchedUnloading = getIn(formik.touched, unloading);
                  const errorUnloading = getIn(formik.errors, unloading);

                  return (
                    <React.Fragment>
                      {index > 0 && <Divider sx={{ mb: 2 }} />}

                      <Grid
                        container
                        spacing={1}
                        className="row"
                        key={index}
                        alignItems={"center"}
                        sx={{ my: 2 }}
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
                      </Grid>
                      <Grid
                        container
                        spacing={1}
                        className="row"
                        alignItems={"center"}
                        sx={{ my: 2 }}
                      >
                        <Grid item md={5} xs={12} className="col" key={index}>
                          <AddressAutocomplete
                            type={"consignor"}
                            partyId={order.customer.id}
                            user={user}
                            formik={formik}
                          />
                        </Grid>
                        <Grid item md={5} xs={12} className="col">
                          <AddressAutocomplete
                            type={"consignee"}
                            partyId={order.customer.id}
                            user={user}
                            formik={formik}
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
