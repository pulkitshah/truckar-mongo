/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from "react";
import { Divider, TextField } from "@mui/material";
import { useDispatch, useSelector } from "../../../../store";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useMounted } from "../../../../hooks/use-mounted";
import { partyApi } from "../../../../api/party-api";
import AddNewPartyFromAutocomplete from "../party-autocomplete/party-addnew-autocomplete";
import { useAuth } from "../../../../hooks/use-auth";

const PartyAutocomplete = ({ sx, formik, type }) => {
  const dispatch = useDispatch();
  const isMounted = useMounted();
  const { account } = useAuth();
  const filter = createFilterOptions();
  const { touched, errors, handleBlur, setFieldValue, values } = formik;
  const [open, toggleOpen] = React.useState(false);
  // const parties = useSelector((state) => state.parties.parties);
  const [dialogValue, setDialogValue] = React.useState({
    name: "",
    isTransporter: type !== "customer" ? true : false,
  });

  const [value, setValue] = React.useState(values && values[type]);
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const getPartiesByUser = useCallback(async () => {
    try {
      const { data } = await partyApi.getPartiesByAccount({
        account: account._id,
        value: inputValue,
      });

      if (isMounted()) {
        let newOptions = [];

        // if (value) {
        //   newOptions = [value];
        // }

        if (data) {
          newOptions = [...newOptions, ...data];
        }

        setOptions(newOptions);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted, inputValue]);

  useEffect(() => {
    try {
      let active = true;

      if (inputValue === "") {
        setOptions(value ? [value] : []);
        return undefined;
      }

      getPartiesByUser(value);

      return () => {
        active = false;
      };
    } catch (error) {
      console.log(error);
    }
  }, [value, inputValue]);

  return (
    <React.Fragment>
      <Autocomplete
        sx={sx}
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
              transporter: type !== "customer" ? true : false,
            });
          } else if (newValue && newValue.inputValue) {
            toggleOpen(true);
            setDialogValue({
              name: newValue.inputValue,
              transporter: type !== "customer" ? true : false,
            });
          } else {
            setFieldValue(type, newValue);
            setValue(newValue);
          }

          setOptions(newValue ? [newValue, ...options] : options);
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        id={type}
        options={options.filter((o) =>
          type !== "customer" ? o.isTransporter === true : o === o
        )}
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
                {option.mobile && `(M) ${option.mobile.replace(/ /g, "")}`}
                <br />
                {option.city &&
                  `City - ${option.city.structured_formatting.main_text}`}
                <Divider />
              </li>
            </React.Fragment>
          );
        }}
        fullWidth
        freeSolo
        renderInput={(params) => (
          <TextField
            onKeyPress={(e) => {
              e.which === 13 && e.preventDefault();
            }}
            {...params}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            error={Boolean(
              type === "customer"
                ? touched.customer && errors.customer
                : touched.transporter && errors.transporter
            )}
            onBlur={handleBlur}
            helperText={
              type === "customer"
                ? touched.customer && errors.customer
                : touched.transporter && errors.transporter
            }
            variant="outlined"
          />
        )}
      />

      <AddNewPartyFromAutocomplete
        open={open}
        toggleOpen={toggleOpen}
        dialogValue={dialogValue}
        setDialogValue={setDialogValue}
        setFieldValue={formik.setFieldValue}
        type={type}
      />
    </React.Fragment>
  );
};
export default PartyAutocomplete;
