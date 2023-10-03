import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useAuth } from "../../../../hooks/use-auth";

const TaxAutocomplete = ({
  sx,
  error,
  touched,
  name,
  setFieldValue,
  handleBlur,
  values,
  index,
  type,
  tax,
  ...rest
}) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const [inputValue, setInputValue] = React.useState("");
  const [taxes, setTaxes] = useState(user.taxOptions);
  const [value, setValue] = React.useState(
    values.taxes[index][type] ? values.taxes[index][type] : null
  );

  useEffect(() => {
    if (tax) {
      setValue(tax);
      setFieldValue("tax", value);
    }
  }, [tax, setFieldValue, value]);

  const handleOnChange = async (event, newValue) => {
    setValue(newValue);
    setFieldValue(`taxes[${index}]`, newValue);
  };

  return (
    <Autocomplete
      sx={sx}
      autoSelect={true}
      blurOnSelect={true}
      id="tax"
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionLabel={(option) => {
        return option ? `${option.name} - ${option.value}%` : "";
      }}
      options={taxes}
      value={value}
      onChange={handleOnChange}
      renderInput={(params) => (
        <TextField
          {...params}
          name="tax"
          label="Tax"
          error={error}
          helperText={touched && error ? error : ""}
          onBlur={handleBlur}
          variant="outlined"
        />
      )}
    />
  );
};

TaxAutocomplete.propTypes = {
  className: PropTypes.string,
};

export default TaxAutocomplete;
