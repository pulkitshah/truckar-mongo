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
  touched,
  error,
  values,
  index,
  type,
}) {
  const [value, setValue] = React.useState(
    values.deliveries[index][type] ? values.deliveries[index][type] : null
  );
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);

  React.useEffect(() => {
    setValue(values.deliveries[index][type]);
  }, [values.deliveries.length]);

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
        new google.maps.places.AutocompleteService();
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
      id={`deliveries[${index}].${type}`}
      autoSelect={true}
      disableClearable
      onBlur={handleBlur}
      blurOnSelect={true}
      //   sx={{ width: 300 }}
      getOptionLabel={(option) =>
        option.structured_formatting
          ? option.structured_formatting.main_text
          : ""
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
                formik.setFieldValue(`deliveries[${index}].${type}`, {
                  latitude: results[0].geometry.location.lat(),
                  longitude: results[0].geometry.location.lng(),
                  description: newValue.description,
                  structured_formatting: newValue.structured_formatting,
                  place_id: newValue.place_id,
                  address_components: results[0].address_components.map(
                    (add) => {
                      return add.long_name;
                    }
                  ),
                });

                // formik.setFieldValue(
                //   `deliveries[${index}].${type}.latitude`,
                //   results[0].geometry.location.lat()
                // );
                // formik.setFieldValue(
                //   `deliveries[${index}].${type}.longitude`,
                //   results[0].geometry.location.lng()
                // );
                // formik.setFieldValue(
                //   `deliveries[${index}].${type}.description`,
                //   newValue.description
                // );
                // formik.setFieldValue(
                //   `deliveries[${index}].${type}.structured_formatting`,
                //   newValue.structured_formatting
                // );
                // formik.setFieldValue(
                //   `deliveries[${index}].${type}.place_id`,
                //   newValue.place_id
                // );
                // formik.setFieldValue(
                //   `deliveries[${index}].${type}.address_components`,
                //   results[0].address_components.map((add) => {
                //     return add.long_name;
                //   })
                // );
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
          helperText={touched && error ? error : ""}
          error={Boolean(touched && error)}
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
