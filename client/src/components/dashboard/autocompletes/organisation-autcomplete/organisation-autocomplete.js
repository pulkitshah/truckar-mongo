import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useMounted } from "../../../../hooks/use-mounted";
import { useDispatch } from "../../../../store";
import { organisationApi } from "../../../../api/organisation-api";
import { useAuth } from "../../../../hooks/use-auth";

const OrganisationAutocomplete = ({
  sx,
  formik,
  organisation,
  setOrganisation,
  ...rest
}) => {
  const dispatch = useDispatch();
  const isMounted = useMounted();
  const { account } = useAuth();
  const { touched, setFieldValue, errors, handleBlur, values } = formik;
  const [open, setOpen] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [value, setValue] = React.useState(values && values.organisation);
  const [inputValue, setInputValue] = React.useState("");

  const loading = open && organisations.length === 0;

  const getOrganisations = useCallback(async () => {
    try {
      const response = await organisationApi.getOrganisationsByAccount(
        dispatch,
        account._id
      );
      if (isMounted()) {
        setOrganisations(response.data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    getOrganisations();

    if (!open) {
      setOrganisations([]);
    }
  }, [getOrganisations, open]);

  useEffect(() => {
    if (organisation) {
      setValue(organisation);
      setFieldValue("organisation", value);
    }
  }, [organisation, setFieldValue, value]);

  const handleOnChange = async (event, newValue) => {
    setValue(newValue);
    setFieldValue("organisation", newValue);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
  };

  return (
    <Autocomplete
      sx={sx}
      autoSelect={true}
      blurOnSelect={true}
      id="organisation"
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      // getOptionSelected={(option, value) => {
      //   return option.name === value.name;
      // }}
      getOptionLabel={(option) => {
        return option ? option.name : "";
      }}
      options={organisations}
      loading={loading}
      value={value}
      onChange={handleOnChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      renderInput={(params) => (
        <TextField
          {...params}
          name="organisation"
          label="Organisation"
          error={Boolean(touched.organisation && errors.organisation)}
          helperText={touched.organisation && errors.organisation}
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
  );
};

OrganisationAutocomplete.propTypes = {
  className: PropTypes.string,
};

export default OrganisationAutocomplete;
