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
import { Trash as TrashIcon } from "../../../icons/trash";
import { Plus as PlusIcon } from "../../../icons/plus";

const GoodsDescriptionDetails = ({ sx, formik, ...rest }) => {
  const [noOfDeliveries, setNoOfDeliveries] = React.useState(1);
  const [googleResponse, setResponse] = React.useState([]);

  return (
    <React.Fragment>
      <FormikProvider value={formik}>
        <FieldArray name="descriptionOfGoods" error={formik.errors}>
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
                        description: "",
                        packages: "",
                        packing: "",
                      });
                    }}
                  >
                    Add
                  </Button>
                </Grid>
              </Grid>
              {formik.values.descriptionOfGoods.length > 0 &&
                formik.values.descriptionOfGoods.map((delivery, index) => {
                  const description = `descriptionOfGoods[${index}].description`;
                  const touchedDescription = getIn(formik.touched, description);
                  const errorDescription = getIn(formik.errors, description);

                  const packages = `descriptionOfGoods[${index}].packages`;
                  const touchedPackages = getIn(formik.touched, packages);
                  const errorPackages = getIn(formik.errors, packages);

                  const packing = `descriptionOfGoods[${index}].packing`;
                  const touchedPacking = getIn(formik.touched, packing);
                  const errorPacking = getIn(formik.errors, packing);

                  return (
                    <React.Fragment>
                      {index > 0 && <Divider sx={{ mb: 2 }} />}

                      <Grid
                        container
                        spacing={1}
                        className="row"
                        key={index + 1}
                        alignItems={"center"}
                        sx={{ mb: 2 }}
                      >
                        <Grid item md={4} xs={12} className="col">
                          <TextField
                            helperText={
                              touchedDescription && errorDescription
                                ? errorDescription
                                : ""
                            }
                            error={Boolean(
                              touchedDescription && errorDescription
                            )}
                            variant="outlined"
                            onChange={(event) => {
                              formik.setFieldValue(
                                `descriptionOfGoods[${index}].description`,
                                event.target.value
                              );
                            }}
                            onBlur={formik.handleBlur}
                            id="description"
                            name="description"
                            label="Description"
                            fullWidth
                            value={
                              formik.values.descriptionOfGoods[index]
                                .description
                            }
                          />
                        </Grid>
                        <Grid item md={4} xs={12} className="col">
                          <TextField
                            helperText={
                              touchedPackages && errorPackages
                                ? errorPackages
                                : ""
                            }
                            error={Boolean(touchedPackages && errorPackages)}
                            variant="outlined"
                            onChange={(event) => {
                              formik.setFieldValue(
                                `descriptionOfGoods[${index}].packages`,
                                event.target.value
                              );
                            }}
                            onBlur={formik.handleBlur}
                            id="packages"
                            name="packages"
                            label="No of Packages"
                            fullWidth
                            value={
                              formik.values.descriptionOfGoods[index].packages
                            }
                          />
                        </Grid>
                        <Grid item md={4} xs={12} className="col" key={index}>
                          <TextField
                            helperText={
                              touchedPacking && errorPacking ? errorPacking : ""
                            }
                            error={Boolean(touchedPacking && errorPacking)}
                            variant="outlined"
                            onChange={(event) => {
                              formik.setFieldValue(
                                `descriptionOfGoods[${index}].packing`,
                                event.target.value
                              );
                            }}
                            onBlur={formik.handleBlur}
                            id="packing"
                            name="packing"
                            label="Packing"
                            fullWidth
                            value={
                              formik.values.descriptionOfGoods[index].packing
                            }
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

export default GoodsDescriptionDetails;
