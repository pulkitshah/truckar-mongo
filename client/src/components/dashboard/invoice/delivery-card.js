import React, { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { deliveryApi } from "../../../api/delivery-api";
import { useMounted } from "../../../hooks/use-mounted";
import moment from "moment";
import {
  calculateAmountForDelivery,
  formatNumber,
} from "../../../utils/amount-calculation";

export const DeliveryCard = (props) => {
  const { invoiceDelivery, index, ...other } = props;

  const delivery = {
    ...invoiceDelivery.order,
    delivery: invoiceDelivery.order.deliveries.find(
      (e) => e._id === invoiceDelivery.delivery
    ),
    invoiceCharges: invoiceDelivery.invoiceCharges,
    particular: invoiceDelivery.particular,
  };

  const mdDown = useMediaQuery((theme) => theme.breakpoints.down("md"));

  return (
    <React.Fragment>
      <Card sx={{ mt: 3 }} variant="outlined" key={index}>
        <CardContent>
          <Grid
            container
            spacing={1}
            className="row"
            key={delivery._id}
            justifyContent={"space-between"}
          >
            <Grid item xs={12} className="col">
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body2">Order No</Typography>
                  <Typography sx={{ mb: 3 }} variant="body2">
                    {delivery.orderNo}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">LR No</Typography>
                  <Typography sx={{ mb: 3 }} variant="body2">
                    {Object.keys(delivery.delivery.lr).length
                      ? `${delivery.delivery.lr.organisation.initials} - ${delivery.delivery.lr.lrNo}`
                      : "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2">Sale Date</Typography>
                  <Typography sx={{ mb: 3 }} variant="body2">
                    {moment(delivery.saleDate).format("DD/MM/YYYY")}
                  </Typography>
                </Box>
                {!mdDown && (
                  <React.Fragment>
                    <Box>
                      <Typography variant="body2">From</Typography>
                      <Typography sx={{ mb: 3 }} variant="body2">
                        {
                          delivery.delivery.loading.structured_formatting
                            .main_text
                        }
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">To</Typography>
                      <Typography sx={{ mb: 3 }} variant="body2">
                        {
                          delivery.delivery.unloading.structured_formatting
                            .main_text
                        }
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Bill Quantity</Typography>
                      {delivery.delivery.billQuantity ? (
                        <Typography sx={{ mb: 3 }} variant="body2">
                          {`${delivery.delivery.billQuantity} ${delivery.saleType.unit}`}
                        </Typography>
                      ) : (
                        <Typography sx={{ mb: 3 }} variant="body2">
                          {" N/A"}
                        </Typography>
                      )}
                    </Box>
                  </React.Fragment>
                )}
              </Box>
            </Grid>
            {mdDown && (
              <Grid item xs={12} className="col">
                <React.Fragment>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="body2">From</Typography>
                      <Typography sx={{ mb: 3 }} variant="body2">
                        {
                          delivery.delivery.loading.structured_formatting
                            .main_text
                        }
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">To</Typography>
                      <Typography sx={{ mb: 3 }} variant="body2">
                        {
                          delivery.delivery.unloading.structured_formatting
                            .main_text
                        }
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2">Bill Quantity</Typography>
                      <Typography sx={{ mb: 3 }} variant="body2">
                        {delivery.delivery.billQuantity ? (
                          <Typography sx={{ mb: 3 }} variant="body2">
                            {`${delivery.delivery.billQuantity} ${delivery.saleType.unit}`}
                          </Typography>
                        ) : (
                          <Typography sx={{ mb: 3 }} variant="body2">
                            {" N/A"}
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </React.Fragment>
              </Grid>
            )}
            <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Grid item md={10} xs={12} className="col">
                <Box>
                  <Typography variant="body2">Particulars</Typography>
                  <Typography variant="body2">
                    {`${delivery.particular || ""}`}
                  </Typography>
                </Box>
              </Grid>

              <Grid item md={2} xs={12} className="col">
                <Typography variant="body2">Amount</Typography>
                <Typography variant="body2">
                  {formatNumber(calculateAmountForDelivery(delivery, "sale"))}
                </Typography>
              </Grid>

              {delivery.invoiceCharges.map(
                (invoiceCharge, indexInvoiceCharge) => {
                  return (
                    <React.Fragment>
                      <Grid
                        item
                        md={10}
                        xs={12}
                        className="col"
                        key={indexInvoiceCharge}
                        sx={{ mt: 2 }}
                      >
                        <Box>
                          <Typography variant="body2">Extra Charges</Typography>
                          <Typography sx={{ mb: 3 }} variant="body2">
                            {`${invoiceCharge.particular || ""} `}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item md={2} xs={12} className="col">
                        <Box>
                          <Typography variant="body2">Amount</Typography>
                          <Typography variant="body2">
                            {`Rs. ${invoiceCharge.amount} `}
                          </Typography>
                        </Box>
                      </Grid>
                    </React.Fragment>
                  );
                }
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </React.Fragment>
  );
};
