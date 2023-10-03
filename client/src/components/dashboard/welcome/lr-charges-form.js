import React from "react";
import { v4 as uuidv4 } from "uuid";
import { FormikProvider, FieldArray, getIn } from "formik";

import {
  Box,
  Button,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Trash as TrashIcon } from "../../../icons/trash";

const LrChargeForm = ({ formik, handleNext }) => {
  const {
    touched,
    setFieldValue,
    errors,
    handleBlur,
    handleChange,
    handleSubmit,
    values,
  } = formik;

  const [noOfCharges, setNoOfCharges] = React.useState(
    values.lrCharges.length > 0 ? values.lrCharges.length : 1
  );

  return (
    <React.Fragment>
      <FormikProvider value={formik}>
        <FieldArray name="lrCharges" error={errors}>
          {({ remove, push }) => (
            <React.Fragment>
              <Grid
                container
                spacing={3}
                justifyContent="space-between"
                alignItems={"center"}
                sx={{ mt: 1, mb: 2 }}
              >
                <Grid item>
                  <Typography variant="body">
                    Type of Charges: {noOfCharges}
                  </Typography>
                </Grid>
              </Grid>

              {values.lrCharges.map((delivery, index) => {
                const chargeSrNo = `lrCharges[${index}].chargeSrNo`;
                const touchedChargeSrNo = getIn(touched, chargeSrNo);
                const errorChargeSrNo = getIn(errors, chargeSrNo);

                const chargeName = `lrCharges[${index}].chargeName`;
                const touchedChargeName = getIn(touched, chargeName);
                const errorChargeName = getIn(errors, chargeName);

                const chargeDefaultAmount = `lrCharges[${index}].chargeDefaultAmount`;
                const touchedChargeDefaultAmount = getIn(
                  touched,
                  chargeDefaultAmount
                );
                const errorChargeDefaultAmount = getIn(
                  errors,
                  chargeDefaultAmount
                );

                return (
                  <React.Fragment>
                    {index > 0 && <Divider sx={{ my: 2 }} />}
                    <Grid container spacing={3} className="row" key={index}>
                      <Grid item xs={2}>
                        <TextField
                          value={index + 1}
                          disabled={true}
                          variant="outlined"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={chargeSrNo}
                          name={chargeSrNo}
                          helperText={
                            touchedChargeSrNo && errorChargeSrNo
                              ? errorChargeSrNo
                              : ""
                          }
                          error={Boolean(touchedChargeSrNo && errorChargeSrNo)}
                          label="Sr No."
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4} className="col" key={index}>
                        {/* {console.log(values.lrCharges[index])} */}
                        <TextField
                          value={
                            values.lrCharges[index].chargeName
                              ? values.lrCharges[index].chargeName
                              : null
                          }
                          variant="outlined"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={chargeName}
                          name={chargeName}
                          helperText={
                            touchedChargeName && errorChargeName
                              ? errorChargeName
                              : ""
                          }
                          error={Boolean(touchedChargeName && errorChargeName)}
                          label="Charge Name"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          value={values.lrCharges[index].chargeDefaultAmount}
                          type="number"
                          variant="outlined"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          id={chargeDefaultAmount}
                          name={chargeDefaultAmount}
                          helperText={
                            touchedChargeDefaultAmount &&
                            errorChargeDefaultAmount
                              ? errorChargeDefaultAmount
                              : ""
                          }
                          error={Boolean(
                            touchedChargeDefaultAmount &&
                              errorChargeDefaultAmount
                          )}
                          label="Default Amount"
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={2} className="col" alignSelf={"center"}>
                        <Button
                          color="error"
                          onClick={() => {
                            setNoOfCharges(noOfCharges - 1);
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
                      chargeSrNo: noOfCharges + 1,
                      chargeName: "",
                      chargeDefaultAmount: 0,
                    });
                    setNoOfCharges(noOfCharges + 1);
                  }}
                >
                  Add Charge
                </Button>
                <Button
                  color="secondary"
                  onClick={() => {
                    handleSubmit();
                    handleNext();
                  }}
                  variant="contained"
                >
                  Save Changes
                </Button>
              </Box>
            </React.Fragment>
          )}
        </FieldArray>
      </FormikProvider>
    </React.Fragment>
  );
};

export default LrChargeForm;
