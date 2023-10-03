import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { useFormik, getIn, FieldArray, FormikProvider } from "formik";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import moment from "moment";
import { Storage } from "aws-amplify";
import LrPDFs from "./LrPDFs";

import {
  Box,
  Button,
  Dialog,
  Divider,
  Drawer,
  Grid,
  Hidden,
  IconButton,
  InputAdornment,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { X as XIcon } from "../../../icons/x";
import EditIcon from "@mui/icons-material/Edit";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Trash as TrashIcon } from "../../../icons/trash";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import DeliveryDetails from "./delivery-details";
import GoodsDescriptionDetails from "./goods-description-details";
import OrganisationAutocomplete from "../autocompletes/organisation-autcomplete/organisation-autocomplete";
import GoogleMaps from "./google-maps";
import { lrApi } from "../../../api/lr-api";
import { dataFormatter } from "../../../utils/amount-calculation";

const statusOptions = [
  {
    label: "Canceled",
    value: "canceled",
  },
  {
    label: "Complete",
    value: "complete",
  },
  {
    label: "Pending",
    value: "pending",
  },
  {
    label: "Rejected",
    value: "rejected",
  },
];

const LrPreview = (props) => {
  const { lgUp, onApprove, onEdit, onReject, lr, gridApi } = props;
  const [viewPDF, setViewPDF] = useState(false);
  const LrFormat = LrPDFs[lr ? lr.lrFormat : "standardLoose"];

  const align = lgUp ? "horizontal" : "vertical";
  const [logo, setLogo] = useState();
  const { user } = useAuth();
  const dispatch = useDispatch();

  const getOrganisationLogo = useCallback(async () => {
    try {
      const logo = await Storage.get(lr.organisation.logo);
      setLogo(logo);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    try {
      getOrganisationLogo();
    } catch (error) {
      console.log(error);
    }
  }, []);

  let delivery = lr.delivery;

  const formik = useFormik({
    initialValues: {
      id: lr.id,
      lrCharges: JSON.parse(lr.lrCharges),
    },
    // validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      try {
        console.log(values);
        const editedLr = {
          id: lr.id,
          lrCharges: JSON.stringify(values.lrCharges),
          user: user.id,
          _version: lr._version,
        };
        console.log(editedLr);

        await lrApi.updateLr(editedLr, dispatch);
        gridApi.refreshInfiniteCache();
        toast.success("Lr created!");
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <>
      <Box
        sx={{
          alignItems: "center",
          blrRadius: 1,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ mt: 3 }} variant="h6">
          Lr Details
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
              document={<LrFormat logo={logo} lr={lr} printRates={false} />}
              fileName={`Lr - ${lr.organisation.initials}-${lr.lrNo}`}
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
          label="Lr No"
          value={`${lr.lrNo}`}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="LR Date"
          value={moment(lr.lrDate).format("DD/MM/YY")}
        />

        <PropertyListItem
          align={align}
          disableGutters
          label="Organisation"
          value={lr.organisation.name}
        />
        <Divider sx={{ my: 3 }} />

        <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
          Delivery Details
        </Typography>
        <PropertyListItem
          align={align}
          disableGutters
          label="Loading From"
          value={JSON.parse(delivery.loading).description}
        />

        <PropertyListItem align={align} disableGutters label="Consignor">
          <Typography color="primary" variant="body2">
            {lr.consignor.name}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignor.billingAddressLine1}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignor.billingAddressLine2}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {JSON.parse(lr.consignor.city).description}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignor.pan && `PAN - ${lr.consignor.pan}`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignor.gstin && `GSTIN - ${lr.consignor.gstin}`}
          </Typography>
        </PropertyListItem>
        <PropertyListItem
          align={align}
          disableGutters
          label="Unloading at"
          value={JSON.parse(delivery.unloading).description}
        />
        <PropertyListItem align={align} disableGutters label="Consignee">
          <Typography color="primary" variant="body2">
            {lr.consignee.name}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignor.billingAddressLine1}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignor.billingAddressLine2}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {JSON.parse(lr.consignee.city).description}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignee.pan && `PAN - ${lr.consignee.pan}`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignee.gstin && `GSTIN - ${lr.consignee.gstin}`}
          </Typography>
        </PropertyListItem>
        <Divider sx={{ my: 2 }} />
        {
          <form onSubmit={formik.handleSubmit} {...props}>
            <Typography sx={{ mt: 6, mb: 4 }} variant="h6">
              Charges
            </Typography>
            <FormikProvider value={formik}>
              <FieldArray name="lrCharges" error={formik.errors}>
                {({ remove, push }) => (
                  <React.Fragment>
                    {formik.values.lrCharges.map((delivery, index) => {
                      const chargeName = `lrCharges[${index}].chargeName`;
                      const touchedChargeName = getIn(
                        formik.touched,
                        chargeName
                      );
                      const errorChargeName = getIn(formik.errors, chargeName);

                      const chargeDefaultAmount = `lrCharges[${index}].chargeDefaultAmount`;
                      const touchedChargeDefaultAmount = getIn(
                        formik.touched,
                        chargeDefaultAmount
                      );
                      const errorChargeDefaultAmount = getIn(
                        formik.errors,
                        chargeDefaultAmount
                      );

                      return (
                        <React.Fragment>
                          {index > 0 && <Divider sx={{ my: 2 }} />}
                          <Grid
                            container
                            spacing={3}
                            className="row"
                            key={index}
                          >
                            <Grid item xs={6} className="col" key={index}>
                              {/* {console.log(values.lrCharges[index])} */}
                              <TextField
                                value={
                                  formik.values.lrCharges[index].chargeName
                                    ? formik.values.lrCharges[index].chargeName
                                    : null
                                }
                                variant="outlined"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                id={chargeName}
                                name={chargeName}
                                helperText={
                                  touchedChargeName && errorChargeName
                                    ? errorChargeName
                                    : ""
                                }
                                error={Boolean(
                                  touchedChargeName && errorChargeName
                                )}
                                label="Charge Name"
                                fullWidth
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                value={
                                  formik.values.lrCharges[index]
                                    .chargeDefaultAmount
                                    ? formik.values.lrCharges[index]
                                        .chargeDefaultAmount
                                    : null
                                }
                                variant="outlined"
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                id={chargeDefaultAmount}
                                name={chargeDefaultAmount}
                                helperText={
                                  touchedChargeDefaultAmount &&
                                  errorChargeDefaultAmount
                                    ? errorChargeDefaultAmount
                                    : ""
                                }
                                error={Boolean(
                                  touchedChargeDefaultAmount &&
                                    errorChargeDefaultAmount
                                )}
                                label="Amount"
                                fullWidth
                              />
                            </Grid>
                            <Grid
                              item
                              xs={2}
                              className="col"
                              alignSelf={"center"}
                            >
                              <Button
                                color="error"
                                onClick={() => {
                                  remove(index);
                                }}
                              >
                                <TrashIcon fontSize="small" />
                              </Button>
                            </Grid>
                          </Grid>
                        </React.Fragment>
                      );
                    })}
                    <Box
                      sx={{ mt: 2 }}
                      p={2}
                      display="flex"
                      justifyContent="flex-end"
                    >
                      <Button
                        sx={{ mr: 2 }}
                        variant="contained"
                        color="secondary"
                        startIcon={<PlusIcon fontSize="small" />}
                        onClick={() => {
                          push({
                            id: uuidv4(),
                            chargeName: "",
                            chargeDefaultAmount: 0,
                          });
                        }}
                      >
                        Add Charge
                      </Button>
                      <Button
                        color="secondary"
                        onClick={formik.handleSubmit}
                        variant="contained"
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </React.Fragment>
                )}
              </FieldArray>
            </FormikProvider>
          </form>
        }

        {JSON.parse(lr.descriptionOfGoods)[0].description && (
          <React.Fragment>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
              Description of Goods
            </Typography>
            <PropertyListItem align={align} disableGutters label="Description">
              {JSON.parse(lr.descriptionOfGoods).map((goodsDescription) => {
                return (
                  <React.Fragment>
                    <Typography color="textSecondary" variant="body2">
                      {`${goodsDescription.packages} ${goodsDescription.packing} ${goodsDescription.description}`}
                    </Typography>
                  </React.Fragment>
                );
              })}
            </PropertyListItem>
          </React.Fragment>
        )}

        {(lr.insuranceCompany ||
          lr.insuranceDate ||
          lr.insurancePolicyNo ||
          lr.insuranceAmount) && (
          <React.Fragment>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
              Insurance Details
            </Typography>
            {lr.insuranceCompany && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Insurance Company"
                value={lr.insuranceCompany}
              />
            )}
            {lr.insuranceDate && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Insurance Date"
                value={moment(lr.insuranceDate).format("DD/MM/YY")}
              />
            )}
            {lr.insurancePolicyNo && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Insurance Policy No"
                value={lr.insurancePolicyNo}
              />
            )}
            {lr.insuranceAmount && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Insurance Amount"
                value={lr.insuranceAmount}
              />
            )}
          </React.Fragment>
        )}

        {(lr.fareBasis || lr.valueOfGoods || lr.chargedWeight) && (
          <React.Fragment>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
              Other Details
            </Typography>
            {lr.fareBasis && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Fare Basis"
                value={
                  [
                    {
                      value: "tbb",
                      label: "To Be Billed",
                    },
                    {
                      value: "topay",
                      label: "To Pay",
                    },
                  ].find((x) => x.value === lr.fareBasis).label
                }
              />
            )}
            {lr.valueOfGoods && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Value of Goods"
                value={dataFormatter(lr.valueOfGoods, "currency")}
              />
            )}
            {lr.chargedWeight && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Charged Weight"
                value={lr.chargedWeight}
              />
            )}
          </React.Fragment>
        )}

        {(lr.ewayBillNo || lr.ewayBillExpiryDate) && (
          <React.Fragment>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
              E-Way Bill Details
            </Typography>
            {lr.ewayBillNo && (
              <PropertyListItem
                align={align}
                disableGutters
                label="E-Way Bill No"
                value={lr.ewayBillNo}
              />
            )}
            {lr.ewayBillExpiryDate && (
              <PropertyListItem
                align={align}
                disableGutters
                label="E-Way Expiry Date"
                value={moment(lr.ewayBillExpiryDate).format("DD/MM/YY")}
              />
            )}
          </React.Fragment>
        )}
      </PropertyList>
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
              <LrFormat logo={logo} lr={lr} printRates={false} />
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export const LrForm = (props) => {
  const { onCancel, lr, onOpen, gridApi } = props;
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(
    lr.vehicle ? lr.vehicle : lr.vehicleNumber
  );
  const [driver, setDriver] = useState();
  const [addresses, setAddresses] = useState({ waypoints: [] });

  const [purchaseType, setPurchaseType] = React.useState(lr.purchaseType);

  const purchaseTypes = [
    {
      value: "quantity",
      label: "Per Ton",
    },
    {
      value: "fixed",
      label: "Fixed",
    },
  ];

  let validationShape = {
    lrNo: Yup.number()
      .required("Lr No is required")
      .test({
        name: "Checking Duplicate Lr No",
        exclusive: false,
        params: {},
        message: "Lr No cannot be repeated in the fiscal year of sale date",
        test: async function (value) {
          try {
            if (value === lr.lrNo) {
              return true;
            }
            const response = await lrApi.validateDuplicateLrNo(
              value,
              this.parent.lrDate,
              user
            );
            // console.log(response);
            return response;
          } catch (error) {
            console.log(error);
          }
        },
      }),
    lrDate: Yup.object().required("Sale Date is required"),
    customer: Yup.object().nullable().required("Customer is required"),
    vehicle: Yup.lazy((value) => {
      switch (typeof value) {
        case "object":
          return Yup.object().nullable().required("Vehicle is required");
        case "string":
          return Yup.string().required("Vehicle is required");
        default:
          return Yup.string().required("Vehicle is required");
      }
    }),
    saleType: Yup.object().required("Sale is required"),
    saleRate: Yup.string().required("Sale Rate is required"),
  };

  let delivery = lr.delivery;

  const formik = useFormik({
    initialValues: {
      id: lr.id,
      organisation: lr.organisation || "",
      lrDate: moment(lr.lrDate) || moment(),
      lrNo: lr.lrNo || "",
      deliveryDetails: [delivery],
      deliveryId: lr.deliveryId,
      consignee: lr.consignee,
      consignor: lr.consignor,
      saleType: lr.order.saleType
        ? JSON.parse(lr.order.saleType)
        : {
            value: "quantity",
            unit: "MT",
            label: "Per Ton",
          },
      // LR
      descriptionOfGoods: lr.descriptionOfGoods
        ? JSON.parse(lr.descriptionOfGoods)
        : [
            {
              description: "",
              packages: "",
              packing: "",
            },
          ],
      dimesnionsLength: lr.dimesnionsLength || null,
      dimesnionsBreadth: lr.dimesnionsBreadth || null,
      dimesnionsHeight: lr.dimesnionsHeight || null,
      fareBasis: lr.fareBasis || "tbb",
      valueOfGoods: lr.valueOfGoods || null,
      chargedWeight: lr.chargedWeight || null,
      insuranceCompany: lr.insuranceCompany || null,
      insuranceDate: lr.insuranceDate ? moment(lr.insuranceDate) : null,
      insurancePolicyNo: lr.insurancePolicyNo || null,
      insuranceAmount: lr.insuranceAmount || null,
      ewayBillNo: lr.ewayBillNo || null,
      ewayBillExpiryDate: lr.ewayBillExpiryDate
        ? moment(lr.ewayBillExpiryDate)
        : null,
      gstPayableBy: lr.gstPayableBy || "consignor",
    },
    // validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      try {
        const editedLr = {
          id: lr.id,
          lrNo: parseInt(values.lrNo),
          lrDate: values.lrDate.format(),
          orderId: lr.order.id,
          deliveryId: values.deliveryId,
          organisationId: values.organisation.id,
          consigneeId: values.consignee.id,
          consignorId: values.consignor.id,
          descriptionOfGoods: JSON.stringify(values.descriptionOfGoods),
          dimesnionsLength: values.dimesnionsLength,
          dimesnionsBreadth: values.dimesnionsBreadth,
          dimesnionsHeight: values.dimesnionsHeight,
          fareBasis: values.fareBasis,
          valueOfGoods: values.valueOfGoods,
          chargedWeight: values.chargedWeight,
          insuranceCompany: values.insuranceCompany,
          insuranceDate: values.insuranceDate && values.insuranceDate.format(),
          insurancePolicyNo: values.insurancePolicyNo,
          insuranceAmount: values.insuranceAmount,
          ewayBillNo: values.ewayBillNo,
          ewayBillExpiryDate:
            values.ewayBillExpiryDate && values.ewayBillExpiryDate.format(),
          gstPayableBy: values.gstPayableBy,
          lrCharges: JSON.stringify(user.lrSettings[0].lrCharges),
          user: user.id,
          _version: lr._version,
        };
        let newLr = await lrApi.updateLr(editedLr, dispatch);
        onOpen(newLr, gridApi);
        gridApi.refreshInfiniteCache();
        toast.success("Lr created!");
        onCancel();
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  React.useEffect(() => {
    setAddresses({ waypoints: [...addresses.waypoints] });

    // Setting Origin
    setAddresses((addresses) => ({
      ...addresses,
      ...{
        origin: JSON.parse(formik.values.deliveryDetails[0].loading)
          .description,
      },
    }));

    // Setting Destination
    if (
      JSON.parse(
        formik.values.deliveryDetails[formik.values.deliveryDetails.length - 1]
          .unloading
      ).description
    ) {
      setAddresses((addresses) => ({
        ...addresses,
        ...{
          destination: JSON.parse(
            formik.values.deliveryDetails[
              formik.values.deliveryDetails.length - 1
            ].unloading
          ).description,
        },
      }));
    }

    // Setting waypoints

    let waypoints = [];

    formik.values.deliveryDetails.map((delivery) => {
      if (JSON.parse(delivery.loading).description) {
        waypoints.push({
          location: JSON.parse(delivery.loading).description,
        });
      }

      if (JSON.parse(delivery.unloading).description) {
        waypoints.push({
          location: JSON.parse(delivery.unloading).description,
        });
      }
    });

    waypoints = waypoints.filter(
      (waypoint) =>
        waypoint.location !==
        JSON.parse(formik.values.deliveryDetails[0].loading).description
    );
    waypoints = waypoints.filter(
      (waypoint) =>
        waypoint.location !==
        JSON.parse(
          formik.values.deliveryDetails[
            formik.values.deliveryDetails.length - 1
          ].unloading
        ).description
    );

    waypoints = [
      ...new Map(waypoints.map((item) => [item.location, item])).values(),
    ];

    setAddresses({
      origin: JSON.parse(formik.values.deliveryDetails[0].loading).description,
      destination: JSON.parse(
        formik.values.deliveryDetails[formik.values.deliveryDetails.length - 1]
          .unloading
      ).description,
      waypoints: waypoints,
    });
  }, [formik.values.deliveryDetails]);

  return (
    <>
      <form onSubmit={formik.handleSubmit} {...props}>
        <Box
          sx={{
            alignItems: "center",
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "neutral.800" : "neutral.100",
            blrRadius: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
            mb: 2,
          }}
        >
          <Typography variant="overline" sx={{ mr: 2 }} color="textSecondary">
            Lr
          </Typography>
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              m: -1,
              "& > button": {
                m: 1,
              },
            }}
          >
            <Button
              color="primary"
              type="submit"
              size="small"
              variant="contained"
            >
              Save changes
            </Button>
            <Button onClick={onCancel} size="small" variant="outlined">
              Cancel
            </Button>
          </Box>
        </Box>
        <Typography sx={{ mb: 3 }} variant="h6">
          Details
        </Typography>
        <OrganisationAutocomplete sx={{ mb: 2 }} formik={formik} user={user} />
        <DatePicker
          sx={{ my: 2 }}
          id="lrDate"
          name="lrDate"
          label="LR date"
          showTodayButton={true}
          inputFormat="DD/MM/YYYY"
          value={formik.values.lrDate}
          onClick={() => setFieldTouched("end")}
          onChange={(date) => formik.setFieldValue("lrDate", moment(date))}
          slotProps={{
            textField: {
              helperText: formik.touched.lrDate && formik.errors.lrDate,
              error: Boolean(formik.touched.lrDate && formik.errors.lrDate),
            },
          }}
          renderInput={(params) => <TextField fullWidth {...params} />}
        />
        <TextField
          sx={{ my: 2 }}
          error={Boolean(formik.touched.lrNo && formik.errors.lrNo)}
          fullWidth
          helperText={formik.touched.lrNo && formik.errors.lrNo}
          label="LR No"
          name="lrNo"
          onBlur={formik.handleBlur}
          onChange={(event) => {
            formik.setFieldValue(`lrNo`, event.target.value);
          }}
          value={formik.values.lrNo}
        />
        <Divider sx={{ my: 3 }} />

        <Typography sx={{ my: 3 }} variant="h6">
          Delivery details
        </Typography>
        <GoogleMaps sx={{ my: 2 }} addresses={addresses} />
        <DeliveryDetails
          sx={{ my: 2 }}
          formik={formik}
          order={lr.order}
          user={user}
        />

        <Divider sx={{ my: 3 }} />
        <Typography sx={{ my: 3 }} variant="h6">
          Description of Goods
        </Typography>
        <GoodsDescriptionDetails formik={formik} />
        <Divider sx={{ my: 3 }} />
        <Typography sx={{ my: 3 }} variant="h6">
          Dimensions
        </Typography>
        <Grid container spacing={1}>
          <Grid item md={4} xs={12}>
            <TextField
              error={Boolean(
                formik.touched.dimesnionsLength &&
                  formik.errors.dimesnionsLength
              )}
              onBlur={formik.handleBlur}
              helperText={
                formik.touched.dimesnionsLength &&
                formik.errors.dimesnionsLength
              }
              id="dimesnionsLength"
              name="dimesnionsLength"
              label="Length"
              value={formik.values.dimesnionsLength}
              onChange={formik.handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <TextField
              error={Boolean(
                formik.touched.dimesnionsBreadth &&
                  formik.errors.dimesnionsBreadth
              )}
              onBlur={formik.handleBlur}
              helperText={
                formik.touched.dimesnionsBreadth &&
                formik.errors.dimesnionsBreadth
              }
              id="dimesnionsBreadth"
              name="dimesnionsBreadth"
              label="Breadth"
              value={formik.values.dimesnionsBreadth}
              onChange={formik.handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <TextField
              error={Boolean(
                formik.touched.dimesnionsHeight &&
                  formik.errors.dimesnionsHeight
              )}
              onBlur={formik.handleBlur}
              helperText={
                formik.touched.dimesnionsHeight &&
                formik.errors.dimesnionsHeight
              }
              id="dimesnionsHeight"
              name="dimesnionsHeight"
              label="Height"
              value={formik.values.dimesnionsHeight}
              onChange={formik.handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        <Typography sx={{ my: 3 }} variant="h6">
          Insurance Details
        </Typography>
        <TextField
          sx={{ my: 2 }}
          fullWidth
          align="right"
          inputProps={{ "aria-label": "naked" }}
          error={Boolean(
            formik.touched.insuranceCompany && formik.errors.insuranceCompany
          )}
          onBlur={formik.handleBlur}
          helperText={
            formik.touched.insuranceCompany && formik.errors.insuranceCompany
          }
          id="insuranceCompany"
          name="insuranceCompany"
          label="Insurance Co."
          value={formik.values.insuranceCompany}
          onChange={formik.handleChange}
          variant="outlined"
        />
        <DatePicker
          id="insuranceDate"
          name="insuranceDate"
          label="Insurance date"
          showTodayButton={true}
          inputFormat="DD/MM/YYYY"
          value={formik.values.insuranceDate}
          onClick={() => setFieldTouched("end")}
          onChange={(date) =>
            formik.setFieldValue("insuranceDate", moment(date))
          }
          slotProps={{
            textField: {
              helperText:
                formik.touched.insuranceDate && formik.errors.insuranceDate,
              error: Boolean(
                formik.touched.insuranceDate && formik.errors.insuranceDate
              ),
            },
          }}
          renderInput={(params) => <TextField fullWidth {...params} />}
        />
        <TextField
          sx={{ my: 2 }}
          fullWidth
          align="right"
          inputProps={{ "aria-label": "naked" }}
          error={Boolean(
            formik.touched.insurancePolicyNo && formik.errors.insurancePolicyNo
          )}
          onBlur={formik.handleBlur}
          helperText={
            formik.touched.insurancePolicyNo && formik.errors.insurancePolicyNo
          }
          id="insurancePolicyNo"
          name="insurancePolicyNo"
          label="Insurance Policy No"
          value={formik.values.insurancePolicyNo}
          onChange={formik.handleChange}
          variant="outlined"
        />
        <TextField
          fullWidth
          align="right"
          inputProps={{ "aria-label": "naked" }}
          error={Boolean(
            formik.touched.insuranceAmount && formik.errors.insuranceAmount
          )}
          onBlur={formik.handleBlur}
          helperText={
            formik.touched.insuranceAmount && formik.errors.insuranceAmount
          }
          id="insuranceAmount"
          name="insuranceAmount"
          label="Insurance Amount"
          value={formik.values.insuranceAmount}
          onChange={formik.handleChange}
          variant="outlined"
        />
        <Divider sx={{ my: 3 }} />

        <Typography sx={{ my: 3 }} variant="h6">
          Other Details
        </Typography>
        <TextField
          sx={{ my: 2 }}
          error={Boolean(formik.touched.fareBasis && formik.errors.fareBasis)}
          onBlur={formik.handleBlur}
          name="fareBasis"
          label="Fare Basis"
          fullWidth
          id="fareBasis"
          select
          value={formik.values.fareBasis}
          onChange={(event) => {
            formik.setFieldValue("fareBasis", event.target.value);
          }}
          SelectProps={{
            native: true,
          }}
          variant="outlined"
        >
          {[
            {
              value: "tbb",
              label: "To Be Billed",
            },
            {
              value: "topay",
              label: "To Pay",
            },
          ].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>
        <TextField
          sx={{ mb: 2 }}
          fullWidth
          align="right"
          inputProps={{ "aria-label": "naked" }}
          error={Boolean(
            formik.touched.valueOfGoods && formik.errors.valueOfGoods
          )}
          onBlur={formik.handleBlur}
          helperText={formik.touched.valueOfGoods && formik.errors.valueOfGoods}
          id="valueOfGoods"
          name="valueOfGoods"
          label="Value Of Goods"
          value={formik.values.valueOfGoods}
          onChange={formik.handleChange}
          variant="outlined"
        />
        <TextField
          sx={{ mb: 2 }}
          fullWidth
          align="right"
          inputProps={{ "aria-label": "naked" }}
          error={Boolean(
            formik.touched.chargedWeight && formik.errors.chargedWeight
          )}
          onBlur={formik.handleBlur}
          helperText={
            formik.touched.chargedWeight && formik.errors.chargedWeight
          }
          id="chargedWeight"
          name="chargedWeight"
          label="Charged Weight"
          value={formik.values.chargedWeight}
          onChange={formik.handleChange}
          variant="outlined"
        />
        <Divider sx={{ my: 3 }} />

        <Typography sx={{ my: 3 }} variant="h6">
          E-Way Bill Details
        </Typography>
        <TextField
          sx={{ my: 2 }}
          fullWidth
          align="right"
          inputProps={{ "aria-label": "naked" }}
          error={Boolean(formik.touched.ewayBillNo && formik.errors.ewayBillNo)}
          onBlur={formik.handleBlur}
          helperText={formik.touched.ewayBillNo && formik.errors.ewayBillNo}
          id="ewayBillNo"
          name="ewayBillNo"
          label="Eway Bill No"
          value={formik.values.ewayBillNo}
          onChange={formik.handleChange}
          variant="outlined"
        />
        <DatePicker
          id="ewayBillExpiryDate"
          name="ewayBillExpiryDate"
          label="E-Way Bill Expiry date"
          showTodayButton={true}
          inputFormat="DD/MM/YYYY"
          value={formik.values.ewayBillExpiryDate}
          onClick={() => setFieldTouched("end")}
          onChange={(date) =>
            formik.setFieldValue("ewayBillExpiryDate", moment(date))
          }
          slotProps={{
            textField: {
              helperText:
                formik.touched.ewayBillExpiryDate &&
                formik.errors.ewayBillExpiryDate,
              error: Boolean(
                formik.touched.ewayBillExpiryDate &&
                  formik.errors.ewayBillExpiryDate
              ),
            },
          }}
          renderInput={(params) => <TextField fullWidth {...params} />}
        />
        <TextField
          sx={{ my: 2 }}
          error={Boolean(
            formik.touched.gstPayableBy && formik.errors.gstPayableBy
          )}
          onBlur={formik.handleBlur}
          name="gstPayableBy"
          label="GST Payable By"
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          id="gstPayableBy"
          select
          value={formik.values.gstPayableBy}
          onChange={(event) => {
            formik.setFieldValue("gstPayableBy", event.target.value);
          }}
          SelectProps={{
            native: true,
          }}
          variant="outlined"
        >
          {[
            {
              value: "consignor",
              label: "Consignor",
            },
            {
              value: "consignee",
              label: "Consignee",
            },
            {
              value: "transporter",
              label: "Transporter",
            },
          ].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>
        <Button color="error" sx={{ mt: 3 }}>
          Delete lr
        </Button>
      </form>
    </>
  );
};

const LrDrawerDesktop = styled(Drawer)({
  width: 600,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    position: "relative",
    width: 600,
  },
});

const LrDrawerMobile = styled(Drawer)({
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

export const LrDrawer = (props) => {
  const { containerRef, onOpen, onClose, open, lr, gridApi, ...other } = props;
  const [isEditing, setIsEditing] = useState(false);
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  // The reason for doing this, is that the persistent drawer has to be rendered, but not it's
  // content if an lr is not passed.
  const content = lr ? (
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
          {lr.number}
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
          <LrPreview
            onApprove={onClose}
            onEdit={handleEdit}
            onReject={onClose}
            lr={lr}
            lgUp={lgUp}
            gridApi={gridApi}
          />
        ) : (
          <LrForm
            onCancel={handleCancel}
            onOpen={onOpen}
            lr={lr}
            gridApi={gridApi}
          />
        )}
      </Box>
    </>
  ) : null;

  if (lgUp) {
    return (
      <LrDrawerDesktop
        anchor="right"
        open={open}
        SlideProps={{ container: containerRef?.current }}
        variant="persistent"
        {...other}
      >
        {content}
      </LrDrawerDesktop>
    );
  }

  return (
    <LrDrawerMobile
      anchor="right"
      ModalProps={{ container: containerRef?.current }}
      onClose={onClose}
      open={open}
      SlideProps={{ container: containerRef?.current }}
      variant="temporary"
      {...other}
    >
      {content}
    </LrDrawerMobile>
  );
};

LrDrawer.propTypes = {
  containerRef: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  lr: PropTypes.object,
};
