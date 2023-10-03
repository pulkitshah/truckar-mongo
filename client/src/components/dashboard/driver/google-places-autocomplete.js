import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";

const autocompleteService = { current: null };

export default function GoogleMaps({
  label,
  handleBlur,
  formik,
  field,
  values,
}) {
  const [value, setValue] = React.useState(
    values[field] ? values[field] : null
  );
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  const fetch = React.useMemo(
    () =>
      throttle((request, callback) => {
        autocompleteService.current.getPlacePredictions(request, callback);
      }, 200),
    []
  );

  React.useEffect(() => {
    let active = true;

    if (!autocompleteService.current && window.google) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch(
      {
        input: inputValue,
        types: ["(cities)"],
        componentRestrictions: { country: "in" },
        fields: ["address_components", "geometry", "icon", "name"],
      },
      (results) => {
        if (active) {
          let newOptions = [];

          if (value) {
            newOptions = [value];
          }

          if (results) {
            newOptions = [...newOptions, ...results];
          }

          setOptions(newOptions);
        }
      }
    );

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <Autocomplete
      id="google-map-demo"
      autoSelect={true}
      onBlur={handleBlur}
      //   sx={{ width: 300 }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.description
      }
      filterOptions={(x) => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={(event, newValue) => {
        var geocoder = new window.google.maps.Geocoder();
        if (newValue) {
          geocoder.geocode(
            { placeId: newValue.place_id },
            function (results, status) {
              if (status === window.google.maps.GeocoderStatus.OK) {
                formik.setFieldValue(
                  `${field}.latitude`,
                  results[0].geometry.location.lat()
                );
                formik.setFieldValue(
                  `${field}.longitude`,
                  results[0].geometry.location.lng()
                );
                formik.setFieldValue(
                  `${field}.description`,
                  newValue.description
                );
                formik.setFieldValue(
                  `${field}.structured_formatting`,
                  newValue.structured_formatting
                );
                formik.setFieldValue(`${field}.place_id`, newValue.place_id);
                formik.setFieldValue(
                  `branchName`,
                  `${newValue.structured_formatting.main_text} Branch`
                );
              } else {
                alert("Can't find address: " + status);
              }
            }
          );
        }
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={label}
          helperText={
            formik.touched[field] && formik.errors[field]
              ? formik.errors[field]
              : ""
          }
          error={Boolean(formik.touched[field] && formik.errors[field])}
          fullWidth
        />
      )}
      renderOption={(props, option) => {
        const matches =
          option.structured_formatting.main_text_matched_substrings;
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match) => [match.offset, match.offset + match.length])
        );

        return (
          <li {...props}>
            <Grid container alignItems="center">
              <Grid item>
                <Box
                  component={LocationOnIcon}
                  sx={{ color: "text.secondary", mr: 2 }}
                />
              </Grid>
              <Grid item xs>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    style={{
                      fontWeight: part.highlight ? 700 : 400,
                    }}
                  >
                    {part.text}
                  </span>
                ))}

                <Typography variant="body2" color="text.secondary">
                  {option.structured_formatting.secondary_text}
                </Typography>
              </Grid>
            </Grid>
          </li>
        );
      }}
    />
  );
}
