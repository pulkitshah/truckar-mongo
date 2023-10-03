import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { CircularProgress, TextField } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useMounted } from "../../../../hooks/use-mounted";
import { useDispatch } from "../../../../store";
import { addressApi } from "../../../../api/address-api";
import AddNewPartyAddressFromAutocomplete from "./address-addnew-autocomplete";

const AddressAutocomplete = ({
  formik,
  user,
  address,
  partyId,
  type,
  ...rest
}) => {
  const dispatch = useDispatch();
  const isMounted = useMounted();
  const filter = createFilterOptions();
  const { touched, setFieldValue, errors, handleBlur, values } = formik;
  const [open, toggleOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [value, setValue] = React.useState(values[type]);
  const [dialogValue, setDialogValue] = React.useState({
    name: "",
    partyId: partyId,
  });

  const loading = open && addresses.length === 0;

  const getAddresses = useCallback(async () => {
    try {
      const addressesDB = await addressApi.getAddressesByUser(user, dispatch);
      if (isMounted()) {
        setAddresses(addressesDB);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getAddresses();

    if (!open) {
      setAddresses([]);
    }
  }, [getAddresses, open]);

  useEffect(() => {
    if (address) {
      setValue(address);
      setFieldValue(type, value);
    }
  }, [address, setFieldValue, value]);

  return (
    <React.Fragment>
      <Autocomplete
        value={value}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);

          if (params.inputValue !== "") {
            filtered.push({
              inputValue: params.inputValue,
              name: `Add "${params.inputValue}"`,
            });
          }
          return filtered;
        }}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            toggleOpen(true);
            setDialogValue({
              name: newValue.replace(/\w\S*/g, function (txt) {
                return (
                  txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
              }),
              partyId: partyId,
            });
          } else if (newValue && newValue.inputValue) {
            toggleOpen(true);
            setDialogValue({
              name: newValue.inputValue,
              partyId: partyId,
            });
          } else {
            setFieldValue(type, newValue);
            setValue(newValue);
          }
        }}
        id="address"
        options={addresses}
        getOptionLabel={(option) => {
          // e.g value selected with enter, right from the input
          if (typeof option === "string") {
            return option.replace(/\w\S*/g, function (txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
          }
          if (option.inputValue) {
            return option.inputValue.replace(/\w\S*/g, function (txt) {
              return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
          }
          return option.name.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
        }}
        clearOnBlur
        handleHomeEndKeys
        loading={loading}
        fullWidth
        freeSolo
        renderOption={(props, option) => {
          return (
            <React.Fragment>
              <li {...props} key={option.id}>
                {option.name &&
                  option.name.replace(/\w\S*/g, function (txt) {
                    return (
                      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                    );
                  })}
                <br />
              </li>
            </React.Fragment>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            name="address"
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            error={Boolean(touched.address && errors.address)}
            helperText={touched.address && errors.address}
            onBlur={handleBlur}
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <React.Fragment>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </React.Fragment>
              ),
            }}
          />
        )}
      />
      <AddNewPartyAddressFromAutocomplete
        open={open}
        toggleOpen={toggleOpen}
        dialogValue={dialogValue}
        setDialogValue={setDialogValue}
        setFieldValue={formik.setFieldValue}
        type={type}
        user={user}
      />
    </React.Fragment>
  );
};

AddressAutocomplete.propTypes = {
  className: PropTypes.string,
};

export default AddressAutocomplete;
