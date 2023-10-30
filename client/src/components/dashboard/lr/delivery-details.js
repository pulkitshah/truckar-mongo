import React from "react";
import { v4 as uuidv4 } from "uuid";
import { FormikProvider, FieldArray, getIn } from "formik";
import {
  Card,
  Grid,
  Typography,
  Button,
  Divider,
  InputAdornment,
  TextField,
} from "@mui/material";
import AddressAutocomplete from "../autocompletes/address-autocomplete/address-autocomplete";

const DeliveryForm = ({ sx, formik, order, user, ...rest }) => {
  const [noOfDeliveries, setNoOfDeliveries] = React.useState(1);
  const [googleResponse, setResponse] = React.useState([]);

  return (
    <React.Fragment>
      <FormikProvider value={formik}>
        <FieldArray name="deliveries" error={formik.errors}>
          {() => (
            <React.Fragment>
              {formik.values.deliveries.length > 0 &&
                formik.values.deliveries.map((delivery, index) => {
                  return (
                    <React.Fragment>
                      {index > 0 && <Divider sx={{ mb: 2 }} />}
                      <Grid
                        container
                        spacing={1}
                        className="row"
                        key={index}
                        sx={{ my: 2 }}
                      >
                        <Grid item xs={12} className="col" key={index}>
                          <Card sx={{ p: 2, my: 3 }}>
                            <Grid container justify="space-between" spacing={3}>
                              <Grid item textAlign={"center"} xs={4}>
                                <Typography variant="h5" color="textPrimary">
                                  {
                                    formik.values.deliveries[index].loading
                                      .structured_formatting.main_text
                                  }
                                </Typography>
                                <Typography
                                  variant="overline"
                                  color="textSecondary"
                                >
                                  Loading
                                </Typography>
                              </Grid>
                              <Grid item textAlign={"center"} xs={4}>
                                <Typography variant="h5" color="textPrimary">
                                  {
                                    formik.values.deliveries[index].unloading
                                      .structured_formatting.main_text
                                  }
                                </Typography>
                                <Typography
                                  variant="overline"
                                  color="textSecondary"
                                >
                                  Unloading
                                </Typography>
                              </Grid>
                              <Grid item textAlign={"center"} xs={4}>
                                <Typography variant="h5" color="textPrimary">
                                  {`${formik.values.deliveries[index].billQuantity} ${formik.values.saleType.unit}`}
                                </Typography>
                                <Typography
                                  variant="overline"
                                  color="textSecondary"
                                >
                                  Bill Quantity
                                </Typography>
                              </Grid>
                            </Grid>
                          </Card>
                        </Grid>
                        <Grid item md={6} xs={12} className="col" key={index}>
                          <AddressAutocomplete
                            type={"consignor"}
                            partyId={order.customer._id}
                            user={user}
                            formik={formik}
                          />
                        </Grid>
                        <Grid item md={6} xs={12} className="col">
                          <AddressAutocomplete
                            type={"consignee"}
                            partyId={order.customer._id}
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
