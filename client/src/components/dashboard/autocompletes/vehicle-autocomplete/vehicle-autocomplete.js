import React, { useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "../../../../store";
import { vehicleNumberFormatter } from "../../../../utils/customFormatters";
import { Autocomplete, Divider, Grid, TextField } from "@mui/material";
import { useMounted } from "../../../../hooks/use-mounted";
import { vehicleApi } from "../../../../api/vehicle-api";
import { useAuth } from "../../../../hooks/use-auth";

const VehicleAutocomplete = ({
  sx,
  touched,
  setFieldValue,
  errors,
  handleBlur,
  setSelectedVehicle,
  setDriver,
  currentValue,
  user,
}) => {
  const dispatch = useDispatch();
  const isMounted = useMounted();
  const { account } = useAuth();
  const [open, setOpen] = useState(false);
  const { vehicles } = useSelector((state) => state.vehicles);

  const [value, setValue] = React.useState(currentValue);
  const [inputValue, setInputValue] = React.useState(
    typeof currentValue === "object"
      ? `${currentValue.vehicleNumber}`
      : currentValue
  );

  const getVehiclesByAccount = useCallback(async () => {
    try {
      const { data } = await vehicleApi.getVehiclesByAccount(dispatch, account);
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, inputValue]);

  useEffect(() => {
    try {
      getVehiclesByAccount();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleOnChange = async (event, newValue) => {
    setValue(newValue);
    setSelectedVehicle && setSelectedVehicle(newValue);
    setFieldValue("vehicle", newValue);
    try {
      if (
        newValue !== null &&
        typeof newValue === "object" &&
        newValue !== null
      ) {
        let response =
          "await axios.get(`/api/drivers/vehicle/${newValue._id}`);";
        setDriver(response.data);
      } else {
        setSelectedVehicle && setSelectedVehicle("");
        setFieldValue("driver", "");
      }
    } catch (error) {
      setFieldValue("driver", "");
      console.log(error);
    }
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    setSelectedVehicle && setSelectedVehicle(newInputValue);
    setFieldValue("vehicle", newInputValue);
    try {
      if (
        newInputValue !== null &&
        typeof newInputValue === "object" &&
        newInputValue !== null
      ) {
        // axios
        //   .get(`/api/drivers/vehicle/${newInputValue._id}`)
        //   .then(({ data }) => {
        //     setDriver(data);
        //   });
      } else {
        setSelectedVehicle && setSelectedVehicle("");
      }
    } catch (error) {
      setFieldValue("driver", "");

      console.log(error);
    }
  };

  return (
    <Grid item>
      <Autocomplete
        sx={sx}
        freeSolo
        autoSelect={true}
        blurOnSelect={true}
        id="vehicle"
        open={open}
        onOpen={() => {
          setOpen(true);
        }}
        onClose={() => {
          setOpen(false);
        }}
        getOptionLabel={(option) => {
          if (option.vehicleNumber) {
            return option.vehicleNumber;
          } else {
            return option.toUpperCase();
          }
        }}
        options={vehicles}
        value={value}
        onChange={handleOnChange}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        renderOption={(props, option) => {
          return (
            <React.Fragment>
              <li {...props} key={option.id}>
                {option.vehicleNumber}
                <Divider />
              </li>
            </React.Fragment>
          );
        }}
        fullWidth
        renderInput={(params) => (
          <TextField
            {...params}
            name="vehicle"
            label="Vehicle"
            variant="outlined"
            error={Boolean(touched.vehicle && errors.vehicle)}
            fullWidth
            helperText={touched.vehicle && errors.vehicle}
            onBlur={handleBlur}
            InputProps={{
              ...params.InputProps,
              inputComponent: vehicleNumberFormatter,
              endAdornment: (
                <React.Fragment>
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />
    </Grid>
  );
};

VehicleAutocomplete.propTypes = {
  className: PropTypes.string,
};

export default VehicleAutocomplete;
