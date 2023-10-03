import React, { useState } from "react";
import PropTypes from "prop-types";
import { Autocomplete, Grid, TextField } from "@mui/material";

const SaleTypeAutocomplete = ({ formik }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const saleTypes = [
    {
      value: "quantity",
      unit: "Ton",
      label: "Per Ton",
    },
    {
      value: "quantity",
      unit: "Kg",
      label: "Per Kg",
    },
    {
      value: "quantity",
      unit: "Box",
      label: "Per Box",
    },
    {
      value: "quantity",
      unit: "Pc",
      label: "Per Pcs",
    },
    {
      value: "fixed",
      unit: "Ton",
      label: "Fixed",
    },
  ];

  const handleOnChange = (event, newValue) => {
    formik.setFieldValue("saleType", newValue);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  return (
    <Grid item>
      <Autocomplete
        autoSelect={true}
        blurOnSelect={true}
        id="saleType"
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        getOptionSelected={(option, value) => {
          if (value)
            return (
              option.label ===
              value.label.replace(/\w\S*/g, function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              })
            );
        }}
        getOptionLabel={(option) => {
          return option && option.label;
        }}
        freeSolo={false}
        options={saleTypes}
        value={formik.values.saleType}
        onChange={handleOnChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField
            {...params}
            name="saleType"
            label="Sale Type"
            variant="outlined"
            error={Boolean(formik.touched.saleType && formik.errors.saleType)}
            fullWidth
            helperText={formik.touched.saleType && formik.errors.saleType}
            onBlur={formik.handleBlur}
          />
        )}
      />
    </Grid>
  );
};

SaleTypeAutocomplete.propTypes = {
  className: PropTypes.string,
};

export default SaleTypeAutocomplete;
