import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Autocomplete, Grid, TextField } from "@mui/material";
import { useDispatch } from "../../../../store";
import { useMounted } from "../../../../hooks/use-mounted";
import { driverApi } from "../../../../api/driver-api";
import { useAuth } from "../../../../hooks/use-auth";

const DriverAutocomplete = ({
  touched,
  setFieldValue,
  errors,
  handleBlur,
  values,
  driver,
  user,
}) => {
  const { account } = useAuth();
  const [open, setOpen] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [inputValue, setInputValue] = React.useState("");
  const isMounted = useMounted();

  const getDriversByAccount = useCallback(async () => {
    try {
      const { data } = await driverApi.getDriversByAccount({
        account: account._id,
      });

      if (isMounted()) {
        setDrivers(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    try {
      getDriversByAccount();
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    console.log("driver has changed");
    setFieldValue("driver", driver);
  }, [setFieldValue, driver]);

  const handleOnChange = (event, newValue) => {
    setFieldValue("driver", newValue);

    // setFieldValue('driver', newValue);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    // setFieldValue('driver', newInputValue);
  };

  return (
    <Grid item>
      <Autocomplete
        autoSelect={true}
        blurOnSelect={true}
        id="driver"
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
              option.name ===
              value.name.replace(/\w\S*/g, function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              })
            );
        }}
        getOptionLabel={(option) => {
          return (
            option &&
            option.name.replace(/\w\S*/g, function (txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            })
          );
        }}
        options={drivers}
        value={values.driver}
        onChange={handleOnChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        renderInput={(params) => (
          <TextField
            {...params}
            name="driver"
            label="Driver"
            variant="outlined"
            error={Boolean(touched.driver && errors.driver)}
            fullWidth
            helperText={touched.driver && errors.driver}
            onBlur={handleBlur}
          />
        )}
      />
    </Grid>
  );
};

DriverAutocomplete.propTypes = {
  className: PropTypes.string,
};

export default DriverAutocomplete;
