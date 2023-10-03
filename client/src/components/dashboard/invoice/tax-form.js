import React from "react";
import { FormikProvider, FieldArray, getIn } from "formik";
import { Button, Grid } from "@mui/material";
import { Trash as TrashIcon } from "../../../icons/trash";
import TaxAutocomplete from "../autocompletes/tax-autcomplete/tax-autocomplete";

const TaxForm = ({ formik, ...rest }) => {
  const { touched, setFieldValue, errors, handleBlur, values } = formik;
  return (
    <React.Fragment>
      <FormikProvider value={formik}>
        <FieldArray name="taxes" error={errors}>
          {({ remove, push }) => (
            <React.Fragment>
              {values.taxes &&
                values.taxes.map((delivery, index) => {
                  const taxName = `taxes[${index}].taxName`;
                  const touchedTaxName = getIn(touched, taxName);
                  const errorTaxName = getIn(errors, taxName);

                  return (
                    <Grid
                      container
                      spacing={3}
                      sx={{ pt: 2 }}
                      className="row"
                      key={index}
                    >
                      <Grid item xs={9} className="col" key={index}>
                        <TaxAutocomplete
                          error={errorTaxName}
                          touched={touchedTaxName}
                          name={taxName}
                          setFieldValue={setFieldValue}
                          handleBlur={handleBlur}
                          values={values}
                          index={index}
                          type="taxName"
                        />
                      </Grid>
                      <Grid item className="col">
                        <Button
                          color="error"
                          onClick={() => {
                            remove(index);
                          }}
                        >
                          <TrashIcon fontSize="small" />
                        </Button>
                      </Grid>
                    </Grid>
                  );
                })}
              <Grid container spacing={3} sx={{ pt: 2 }}>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      push({ id: "", taxName: "", taxValue: "" });
                    }}
                  >
                    Add Tax
                  </Button>
                </Grid>
              </Grid>
            </React.Fragment>
          )}
        </FieldArray>
      </FormikProvider>
    </React.Fragment>
  );
};

export default TaxForm;
