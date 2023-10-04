/* eslint-disable no-use-before-define */
import React, { useState, useCallback, useEffect } from "react";
import { Divider, TextField } from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { useMounted } from "../../hooks/use-mounted";
import { partyApi } from "../../api/party-api";
import { useAuth } from "../../hooks/use-auth";

const PartyAutocomplete = ({ sx, value, setValue, type }) => {
  const isMounted = useMounted();
  const { account } = useAuth();

  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const getPartiesByAccount = useCallback(async () => {
    try {
      const { data } = await partyApi.getPartiesByAccount(account, inputValue);
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

      getPartiesByAccount(value);

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
        className="ag-custom-component-popup"
        sx={sx}
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
        }}
        id={"customer"}
        options={options}
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
              <li
                className="ag-custom-component-popup"
                {...props}
                key={option.id}
              >
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
        renderInput={(params) => (
          <TextField
            className="ag-custom-component-popup"
            // onKeyPress={(e) => {
            //   e.which === 13 && e.preventDefault();
            // }}
            {...params}
            label={type.charAt(0).toUpperCase() + type.slice(1)}
            variant="outlined"
          />
        )}
      />
    </React.Fragment>
  );
};
export default PartyAutocomplete;
