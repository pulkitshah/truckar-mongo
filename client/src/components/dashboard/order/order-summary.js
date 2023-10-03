import { useState } from "react";
import PropTypes from "prop-types";
import { format } from "date-fns";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import moment from "moment";

const statusOptions = ["Canceled", "Complete", "Rejected"];

export const OrderSummary = (props) => {
  const { order, ...other } = props;
  const smDown = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [status, setStatus] = useState(statusOptions[0]);

  const handleChange = (event) => {
    setStatus(event.target.value);
  };

  const align = smDown ? "vertical" : "horizontal";

  return (
    <Card {...other}>
      <CardHeader title="Basic info" />
      <Divider />
      <PropertyList>
        <PropertyListItem
          align={align}
          label="Order No"
          value={order.orderNo}
        />
        <Divider />
        <PropertyListItem
          align={align}
          label="Sale Date"
          value={moment(order.saleDate).format("DD/MM/YY")}
        />
        <Divider />

        <PropertyListItem align={align} label="Customer">
          <Typography color="primary" variant="body2">
            {`${order.customer.name}`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {JSON.parse(order.customer.city).description}
          </Typography>
        </PropertyListItem>
        <Divider />
        <PropertyListItem align={align} label="Status">
          <Box
            sx={{
              alignItems: {
                sm: "center",
              },
              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              mx: -1,
            }}
          >
            <TextField
              label="Status"
              margin="normal"
              name="status"
              onChange={handleChange}
              select
              SelectProps={{ native: true }}
              sx={{
                flexGrow: 1,
                m: 1,
                minWidth: 150,
              }}
              value={status}
            >
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </TextField>
            <Button sx={{ m: 1 }} variant="contained">
              Save
            </Button>
            <Button sx={{ m: 1 }}>Cancel</Button>
          </Box>
        </PropertyListItem>
      </PropertyList>
    </Card>
  );
};

OrderSummary.propTypes = {
  order: PropTypes.object.isRequired,
};
