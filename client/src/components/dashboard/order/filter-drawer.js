import React, { useState } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik, FormikProvider, FieldArray, getIn } from "formik";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";

import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DeliveryDetailsGrid from "../../../components/dashboard/order/delivery-details-grid";
import { X as XIcon } from "../../../icons/x";
import { Search as SearchIcon } from "../../../icons/search";
import EditIcon from "@mui/icons-material/Edit";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Trash as TrashIcon } from "../../../icons/trash";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import DeliveryDetails from "./delivery-details";
import PartyAutocomplete from "../autocompletes/party-autocomplete/party-autocomplete";
import VehicleAutocomplete from "../autocompletes/vehicle-autocomplete/vehicle-autocomplete";
import DriverAutocomplete from "../autocompletes/driver-autocomplete/driver-autocomplete";
import SaleTypeAutocomplete from "../autocompletes/saleType-autocomplete/saleType-autocomplete";
import GoogleMaps from "./google-maps";
import { orderApi } from "../../../api/order-api";
import { deliveryApi } from "../../../api/delivery-api";

import moment from "moment";
import { dataFormatter } from "../../../utils/amount-calculation";
import { sendOrderConfirmationMessageToOwner } from "../../../utils/whatsapp";

const FilterDrawerDesktop = styled(Drawer)({
  width: "auto",
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    position: "relative",
    width: "auto",
  },
});

const FilterDrawerMobile = styled(Drawer)({
  flexShrink: 0,
  maxWidth: "100%",
  height: "calc(100% - 64px)",
  width: 500,
  "& .MuiDrawer-paper": {
    height: "calc(100% - 64px)",
    maxWidth: "100%",
    top: 64,
    width: 500,
  },
});

export const FilterDrawer = (props) => {
  const { containerRef, onOpen, onClose, open, order, gridApi, ...other } =
    props;
  const [filters, setFilters] = useState({});
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  // The reason for doing this, is that the persistent drawer has to be rendered, but not it's
  // content if an order is not passed.
  const content = (
    <>
      <Box
        sx={{
          alignItems: "center",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      ></Box>
      <Grid
        container
        justifyContent={"space-between"}
        sx={{
          px: 3,
          py: 6,
        }}
      >
        <Grid item sx={{ py: 2 }}>
          <TextField
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {<SearchIcon />}
                </InputAdornment>
              ),
            }}
            label="Order No"
            name="orderNo"
            onChange={(event) => {
              setFilters({ ...filters, orderNo: event.target.value });
            }}
            value={filters.orderNo ? filters.orderNo : ""}
          />
        </Grid>
        <Grid item>
          <IconButton color="inherit" onClick={onClose}>
            <XIcon fontSize="small" />
          </IconButton>
        </Grid>
      </Grid>
    </>
  );

  if (lgUp) {
    return (
      <FilterDrawerDesktop anchor="top" open={open} {...other}>
        {content}
      </FilterDrawerDesktop>
    );
  }

  return (
    <FilterDrawerMobile anchor="top" onClose={onClose} open={open} {...other}>
      {content}
    </FilterDrawerMobile>
  );
};

FilterDrawer.propTypes = {
  containerRef: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  order: PropTypes.object,
};
