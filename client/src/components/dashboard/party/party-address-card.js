import React, { useState } from "react";
import PropTypes from "prop-types";
import { Box, Button, Divider, Typography, useMediaQuery } from "@mui/material";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import { PartyAddressForm } from "./party-address-form";
import EditIcon from "@mui/icons-material/Edit";

export const AddressCard = (props) => {
  const { party, address, ...other } = props;
  const mdUp = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const align = mdUp ? "horizontal" : "vertical";

  const [status, setStatus] = useState(true);
  const toggleStatus = () => {
    setStatus(!status);
  };

  return status ? (
    <React.Fragment key={address.id}>
      <Divider sx={{ my: 1 }} />
      <Box
        sx={{
          alignItems: "center",
          borderRadius: 1,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <PropertyList>
          <PropertyListItem
            align={align}
            disableGutters
            label="Name"
            value={address.name}
          />
        </PropertyList>

        <Box
          sx={{
            alignItems: "center",
            display: "flex",
            flexWrap: "wrap",
            mt: 3,
            m: -1,
            "& > button": {
              m: 1,
            },
          }}
        >
          <Button
            onClick={toggleStatus}
            size="small"
            startIcon={<EditIcon fontSize="small" />}
            // sx={{ pt: 3 }}
          >
            Edit
          </Button>
        </Box>
      </Box>

      <PropertyList>
        <PropertyListItem
          align={align}
          disableGutters
          label="GSTIN"
          value={address.gstin}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="PAN"
          value={address.pan}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="Address Line 1"
          value={address.billingAddressLine1}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="Address Line 2"
          value={address.billingAddressLine2}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="City"
          value={address.city.description}
        />
      </PropertyList>
    </React.Fragment>
  ) : (
    <PartyAddressForm
      address={address}
      toggleStatus={toggleStatus}
      type="edit"
      party={party}
    />
  );
};
