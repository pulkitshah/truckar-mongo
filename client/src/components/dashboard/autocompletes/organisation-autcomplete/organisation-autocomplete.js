import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useMounted } from "../../../../hooks/use-mounted";
import { useDispatch } from "../../../../store";
import { organisationApi } from "../../../../api/organisation-api";

const OrganisationAutocomplete = ({
  sx,
  formik,
  user,
  organisation,
  setOrganisation,
  ...rest
}) => {
  const dispatch = useDispatch();
  const isMounted = useMounted();
  const { touched, setFieldValue, errors, handleBlur, values } = formik;
  const [open, setOpen] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [value, setValue] = React.useState(values && values.organisation);
  const [inputValue, setInputValue] = React.useState("");

  const loading = open && organisations.length === 0;

  const getOrganisations = useCallback(async () => {
    try {
      const organisationsDB = await organisationApi.getOrganisationsByUser(
        user,
        dispatch
      );
      if (isMounted()) {
        setOrganisations(organisationsDB);
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
    // const response = await axios.post(
    //   `/api/lrs/lrnumber/${newValue._id}`,
    //   values
    // );
    // console.log(response.data);
    // setFieldValue("lrNo", response.data);
    setValue(newValue);
    console.log(newValue);
    setFieldValue("organisation", newValue);
  };

  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    // setFieldValue('organisation', newInputValue);
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
