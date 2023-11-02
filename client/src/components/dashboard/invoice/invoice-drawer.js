import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import moment from "moment";

import InvoicePDFs, { invoiceFormats } from "./InvoicePDFs";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  Divider,
  Drawer,
  Grid,
  Hidden,
  IconButton,
  InputAdornment,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { X as XIcon } from "../../../icons/x";
import EditIcon from "@mui/icons-material/Edit";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import { DeliveryCard } from "./delivery-card";
import { deliveryApi } from "../../../api/delivery-api";
import { InvoiceEditForm } from "./invoice-edit-form";

const InvoicePreview = (props) => {
  const { lgUp, onEdit, invoice, gridApi } = props;
  const [viewPDF, setViewPDF] = useState(false);
  const InvoiceFormat =
    InvoicePDFs[invoice ? invoice.invoiceFormat : "standardTableFormat"];
  const align = lgUp ? "horizontal" : "vertical";
  const [logo, setLogo] = useState();
  const { account } = useAuth();

  invoice.account = account;

  console.log(invoice);
  return (
    <>
      <Box
        sx={{
          alignItems: "center",
          binvoiceRadius: 1,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ mt: 3 }} variant="h6">
          Invoice Details
        </Typography>
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
            onClick={onEdit}
            size="small"
            startIcon={<EditIcon fontSize="small" />}
            sx={{ pt: 3 }}
          >
            Edit
          </Button>
          <Hidden smDown>
            <Button
              size="small"
              sx={{ pt: 3 }}
              onClick={() => setViewPDF(true)}
            >
              Preview
            </Button>
          </Hidden>
          {logo && (
            <PDFDownloadLink
              document={
                <InvoiceFormat
                  logo={logo}
                  invoice={invoice}
                  printRates={false}
                />
              }
              fileName={`Invoice - ${invoice.organisation.initials}-${invoice.invoiceNo}`}
              style={{
                textDecoration: "none",
              }}
            >
              <Button
                size="small"
                // startIcon={<EditIcon fontSize="small" />}
                sx={{ pt: 3 }}
              >
                Download
              </Button>
            </PDFDownloadLink>
          )}
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />

      <PropertyList>
        <PropertyListItem
          align={align}
          disableGutters
          label="Invoice No"
          value={`${invoice.invoiceNo}`}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="Invoice Date"
          value={moment(invoice.invoiceDate).format("DD/MM/YY")}
        />

        <PropertyListItem
          align={align}
          disableGutters
          label="Organisation"
          value={invoice.organisation.name}
        />
        <Divider sx={{ my: 3 }} />

        <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
          Customer Details
        </Typography>

        {invoice.customer && (
          <PropertyListItem align={align} disableGutters label="Customer">
            <Typography color="primary" variant="body2">
              {invoice.customer.name}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {invoice.customer.mobile}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {invoice.customer.city.description}
            </Typography>
          </PropertyListItem>
        )}

        {invoice.billingAddress && (
          <PropertyListItem
            align={align}
            disableGutters
            label="Billing Address"
          >
            <Typography color="primary" variant="body2">
              {invoice.billingAddress.name}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {invoice.billingAddress.billingAddressLine1}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {invoice.billingAddress.billingAddressLine2}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {invoice.billingAddress.city.description}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {invoice.billingAddress.pan &&
                `PAN - ${invoice.billingAddress.pan}`}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {invoice.billingAddress.gstin &&
                `GSTIN - ${invoice.billingAddress.gstin}`}
            </Typography>
          </PropertyListItem>
        )}
      </PropertyList>
      <Divider sx={{ my: 3 }} />

      <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
        Invoice Details
      </Typography>
      {invoice.deliveries.map((delivery, index) => {
        return <DeliveryCard invoiceDelivery={delivery} index={index} />;
      })}

      <Dialog fullScreen open={viewPDF}>
        <Box height="100%" display="flex" flexDirection="column">
          <Box bgcolor="common.white" p={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setViewPDF(false)}
            >
              Back
            </Button>
          </Box>
          <Box flexGrow={1}>
            <PDFViewer
              width="100%"
              height="100%"
              style={{
                border: "none",
              }}
            >
              <InvoiceFormat logo={logo} invoice={invoice} printRates={false} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export const InvoiceForm = (props) => {
  const { invoice, onCancel, gridApi } = props;

  return (
    <InvoiceEditForm
      onCancel={onCancel}
      invoice={invoice}
      deliveries={invoice.deliveries}
      gridApi={gridApi}
    />
  );
};

const InvoiceDrawerDesktop = styled(Drawer)({
  width: 600,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    position: "relative",
    width: 600,
  },
});

const InvoiceDrawerMobile = styled(Drawer)({
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

export const InvoiceDrawer = (props) => {
  const { containerRef, onOpen, onClose, open, invoice, gridApi, ...other } =
    props;
  const [isEditing, setIsEditing] = useState(false);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // The reason for doing this, is that the persistent drawer has to be rendered, but not it's
  // content if an invoice is not passed.
  const content = invoice ? (
    <>
      <Box
        sx={{
          alignItems: "center",
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          display: "flex",
          justifyContent: "space-between",
          px: 3,
          py: 2,
        }}
      >
        <Typography color="inherit" variant="h6">
          {invoice.invoiceNo}
        </Typography>
        <IconButton color="inherit" onClick={onClose}>
          <XIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box
        sx={{
          px: 3,
          py: 4,
        }}
      >
        {!isEditing ? (
          <InvoicePreview
            onApprove={onClose}
            onEdit={handleEdit}
            onReject={onClose}
            invoice={invoice}
            lgUp={lgUp}
          />
        ) : (
          <InvoiceForm
            onOpen={onOpen}
            onCancel={handleCancel}
            invoice={invoice}
            gridApi={gridApi}
          />
        )}
      </Box>
    </>
  ) : null;

  if (lgUp) {
    return (
      <InvoiceDrawerDesktop
        anchor="right"
        open={open}
        SlideProps={{ container: containerRef?.current }}
        variant="persistent"
        {...other}
      >
        {content}
      </InvoiceDrawerDesktop>
    );
  }

  return (
    <InvoiceDrawerMobile
      anchor="right"
      ModalProps={{ container: containerRef?.current }}
      onClose={onClose}
      open={open}
      SlideProps={{ container: containerRef?.current }}
      variant="temporary"
      {...other}
    >
      {content}
    </InvoiceDrawerMobile>
  );
};

InvoiceDrawer.propTypes = {
  containerRef: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  invoice: PropTypes.object,
};
