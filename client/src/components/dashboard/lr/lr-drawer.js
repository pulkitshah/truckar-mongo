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
  const { lgUp, onEdit, lr, gridApi } = props;
  console.log(lr);
  const [viewPDF, setViewPDF] = useState(false);
  const LrFormat = LrPDFs["standardLoose"];
  const align = lgUp ? "horizontal" : "vertical";
  const [logo, setLogo] = useState();
  const { account } = useAuth();
  const dispatch = useDispatch();

  let delivery = lr.deliveries;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      _id: lr.deliveries.lr._id,
      lrCharges: lr.deliveries.lr.lrCharges,
    },
    // validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      try {
        const editedLr = {
          _id: lr.deliveries.lr._id,
          lrCharges: values.lrCharges,
          account: account._id,
          _version: lr.deliveries.lr._version,
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
              document={
                <LrFormat
                  logo={logo}
                  lr={{
                    ...lr.deliveries.lr,
                    delivery: lr.deliveries,
                    order: lr,
                  }}
                  printRates={false}
                />
              }
              fileName={`Lr - ${lr.deliveries.lr.organisation.initials}-${lr.deliveries.lr.lrNo}`}
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
          value={`${lr.deliveries.lr.lrNo}`}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="LR Date"
          value={moment(lr.deliveries.lr.lrDate).format("DD/MM/YY")}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="Organisation"
          value={lr.deliveries.lr.organisation.name}
        />
        <Divider sx={{ my: 3 }} />

        <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
          Delivery Details
        </Typography>
        <PropertyListItem
          align={align}
          disableGutters
          label="Loading From"
          value={delivery.loading.description}
        />

        {lr.deliveries.lr.consignor && (
          <PropertyListItem align={align} disableGutters label="Consignor">
            <Typography color="primary" variant="body2">
              {lr.deliveries.lr.consignor.name}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignor.billingAddressLine1}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignor.billingAddressLine2}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignor.city &&
                lr.deliveries.lr.consignor.city.description}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignor.pan &&
                `PAN - ${lr.deliveries.lr.consignor.pan}`}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignor.gstin &&
                `GSTIN - ${lr.deliveries.lr.consignor.gstin}`}
            </Typography>
          </PropertyListItem>
        )}
        <PropertyListItem
          align={align}
          disableGutters
          label="Unloading at"
          value={delivery.unloading.description}
        />
        {lr.deliveries.lr.consignee && (
          <PropertyListItem align={align} disableGutters label="Consignee">
            <Typography color="primary" variant="body2">
              {lr.deliveries.lr.consignee.name}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignee.billingAddressLine1}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignee.billingAddressLine2}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignee.city.description}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignee.pan &&
                `PAN - ${lr.deliveries.lr.consignee.pan}`}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {lr.deliveries.lr.consignee.gstin &&
                `GSTIN - ${lr.deliveries.lr.consignee.gstin}`}
            </Typography>
          </PropertyListItem>
        )}
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
                                _id={chargeName}
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
                                _id={chargeDefaultAmount}
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
                            _id: uuidv4(),
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

        {lr.deliveries.lr.descriptionOfGoods[0].description && (
          <React.Fragment>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
              Description of Goods
            </Typography>
            <PropertyListItem align={align} disableGutters label="Description">
              {lr.deliveries.lr.descriptionOfGoods.map((goodsDescription) => {
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

        {(lr.deliveries.lr.insuranceCompany ||
          lr.deliveries.lr.insuranceDate ||
          lr.deliveries.lr.insurancePolicyNo ||
          lr.deliveries.lr.insuranceAmount) && (
          <React.Fragment>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
              Insurance Details
            </Typography>
            {lr.deliveries.lr.insuranceCompany && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Insurance Company"
                value={lr.deliveries.lr.insuranceCompany}
              />
            )}
            {lr.deliveries.lr.insuranceDate && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Insurance Date"
                value={moment(lr.deliveries.lr.insuranceDate).format(
                  "DD/MM/YY"
                )}
              />
            )}
            {lr.deliveries.lr.insurancePolicyNo && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Insurance Policy No"
                value={lr.deliveries.lr.insurancePolicyNo}
              />
            )}
            {lr.deliveries.lr.insuranceAmount && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Insurance Amount"
                value={lr.deliveries.lr.insuranceAmount}
              />
            )}
          </React.Fragment>
        )}

        {(lr.deliveries.lr.fareBasis ||
          lr.deliveries.lr.valueOfGoods ||
          lr.deliveries.lr.chargedWeight) && (
          <React.Fragment>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
              Other Details
            </Typography>
            {lr.deliveries.lr.fareBasis && (
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
                  ].find((x) => x.value === lr.deliveries.lr.fareBasis).label
                }
              />
            )}
            {lr.deliveries.lr.valueOfGoods && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Value of Goods"
                value={dataFormatter(lr.deliveries.lr.valueOfGoods, "currency")}
              />
            )}
            {lr.deliveries.lr.chargedWeight && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Charged Weight"
                value={lr.deliveries.lr.chargedWeight}
              />
            )}
          </React.Fragment>
        )}

        {(lr.deliveries.lr.ewayBillNo ||
          lr.deliveries.lr.ewayBillExpiryDate) && (
          <React.Fragment>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ mt: 6, mb: 3 }} variant="h6">
              E-Way Bill Details
            </Typography>
            {lr.deliveries.lr.ewayBillNo && (
              <PropertyListItem
                align={align}
                disableGutters
                label="E-Way Bill No"
                value={lr.deliveries.lr.ewayBillNo}
              />
            )}
            {lr.deliveries.lr.ewayBillExpiryDate && (
              <PropertyListItem
                align={align}
                disableGutters
                label="E-Way Expiry Date"
                value={moment(lr.deliveries.lr.ewayBillExpiryDate).format(
                  "DD/MM/YY"
                )}
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
            {console.log(lr)}
            <PDFViewer
              width="100%"
              height="100%"
              style={{
                border: "none",
              }}
            >
              <LrFormat
                logo={logo}
                lr={{ ...lr.deliveries.lr, delivery: lr.deliveries, order: lr }}
                printRates={false}
              />
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
  const { account } = useAuth();
  const [addresses, setAddresses] = useState({ waypoints: [] });

  let validationShape = {
    organisation: Yup.object().nullable().required("Organisation is required"),
    lrDate: Yup.object().required("LR Date is required"),
    lrNo: Yup.number()
      .required("Lr No is required")
      .test({
        name: "Checking Duplicate Lr No",
        exclusive: false,
        params: {},
        message:
          "Lr No cannot be repeated for an organisation in the same fiscal year of LR date",
        test: async function (value) {
          try {
            if (value === lr.deliveries.lr.lrNo) {
              return true;
            }
            const response = await lrApi.validateDuplicateLrNo({
              lrNo: value,
              lrDate: this.parent.lrDate,
              organisation: this.parent.organisation._id,
              account: account._id,
            });
            // console.log(response);
            return response.data;
          } catch (error) {
            console.log(error);
          }
        },
      }),
    consignor: Yup.object().nullable().required("Consignor is Required"), // these constraints take precedence
    consignee: Yup.object().nullable().required("Consignee is Required"), // these constraints take precedence
  };

  let delivery = lr.deliveries;

  const formik = useFormik({
    initialValues: {
      organisation: lr.deliveries.lr.organisation || "",
      lrDate: moment(lr.deliveries.lr.lrDate) || moment(),
      lrNo: lr.deliveries.lr.lrNo || "",
      deliveries: [delivery],
      consignee: lr.deliveries.lr.consignee,
      consignor: lr.deliveries.lr.consignor,
      saleType: lr.saleType
        ? lr.saleType
        : {
            value: "quantity",
            unit: "MT",
            label: "Per Ton",
          },
      // LR
      descriptionOfGoods: lr.deliveries.lr.descriptionOfGoods
        ? lr.deliveries.lr.descriptionOfGoods
        : [
            {
              description: "",
              packages: "",
              packing: "",
            },
          ],
      dimesnionsLength: lr.deliveries.lr.dimesnionsLength || null,
      dimesnionsBreadth: lr.deliveries.lr.dimesnionsBreadth || null,
      dimesnionsHeight: lr.deliveries.lr.dimesnionsHeight || null,
      fareBasis: lr.deliveries.lr.fareBasis || "tbb",
      valueOfGoods: lr.deliveries.lr.valueOfGoods || null,
      chargedWeight: lr.deliveries.lr.chargedWeight || null,
      insuranceCompany: lr.deliveries.lr.insuranceCompany || null,
      insuranceDate: lr.deliveries.lr.insuranceDate
        ? moment(lr.deliveries.lr.insuranceDate)
        : null,
      insurancePolicyNo: lr.deliveries.lr.insurancePolicyNo || null,
      insuranceAmount: lr.deliveries.lr.insuranceAmount || null,
      ewayBillNo: lr.deliveries.lr.ewayBillNo || null,
      ewayBillExpiryDate: lr.deliveries.lr.ewayBillExpiryDate
        ? moment(lr.deliveries.lr.ewayBillExpiryDate)
        : null,
      gstPayableBy: lr.deliveries.lr.gstPayableBy || "consignor",
      lrCharges: lr.deliveries.lr.lrCharges || account.lrSettings[0],
      account: account._id,
    },
    validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      try {
        const newLr = {
          order: lr._id,
          delivery: lr.deliveries._id,
          lrFormat: values.lrFormat,
          lrNo: parseInt(values.lrNo),
          lrDate: values.lrDate.format(),
          organisation: values.organisation._id,
          consignee: values.consignee._id,
          consignor: values.consignor._id,
          descriptionOfGoods: values.descriptionOfGoods,
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
          lrFormat: values.lrFormat,
          lrCharges: values.lrCharges,
        };
        console.log(newLr);

        let { data } = await lrApi.updateLr(newLr, dispatch);
        console.log(data);
        // onOpen && onOpen(data, gridApi);
        gridApi && gridApi.refreshInfiniteCache();
        toast.success("Lr updated!");
        // onCancel();
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
        origin: formik.values.deliveries[0].loading.description,
      },
    }));

    // Setting Destination
    if (
      formik.values.deliveries[formik.values.deliveries.length - 1].unloading
        .description
    ) {
      setAddresses((addresses) => ({
        ...addresses,
        ...{
          destination:
            formik.values.deliveries[formik.values.deliveries.length - 1]
              .unloading.description,
        },
      }));
    }

    // Setting waypoints

    let waypoints = [];

    formik.values.deliveries.map((delivery) => {
      if (delivery.loading.description) {
        waypoints.push({
          location: delivery.loading.description,
        });
      }

      if (delivery.unloading.description) {
        waypoints.push({
          location: delivery.unloading.description,
        });
      }
    });

    waypoints = waypoints.filter(
      (waypoint) =>
        waypoint.location !== formik.values.deliveries[0].loading.description
    );
    waypoints = waypoints.filter(
      (waypoint) =>
        waypoint.location !==
        formik.values.deliveries[formik.values.deliveries.length - 1].unloading
          .description
    );

    waypoints = [
      ...new Map(waypoints.map((item) => [item.location, item])).values(),
    ];

    setAddresses({
      origin: formik.values.deliveries[0].loading.description,
      destination:
        formik.values.deliveries[formik.values.deliveries.length - 1].unloading
          .description,
      waypoints: waypoints,
    });
  }, [formik.values.deliveries]);

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
        <OrganisationAutocomplete
          sx={{ mb: 2 }}
          formik={formik}
          account={account}
        />
        <DatePicker
          sx={{ my: 2 }}
          _id="lrDate"
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
          order={lr}
          account={account}
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
              _id="dimesnionsLength"
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
              _id="dimesnionsBreadth"
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
              _id="dimesnionsHeight"
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
          _id="insuranceCompany"
          name="insuranceCompany"
          label="Insurance Co."
          value={formik.values.insuranceCompany}
          onChange={formik.handleChange}
          variant="outlined"
        />
        <DatePicker
          _id="insuranceDate"
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
          _id="insurancePolicyNo"
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
          _id="insuranceAmount"
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
          _id="fareBasis"
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
          _id="valueOfGoods"
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
          _id="chargedWeight"
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
          _id="ewayBillNo"
          name="ewayBillNo"
          label="Eway Bill No"
          value={formik.values.ewayBillNo}
          onChange={formik.handleChange}
          variant="outlined"
        />
        <DatePicker
          _id="ewayBillExpiryDate"
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
          _id="gstPayableBy"
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
          {lr.deliveries.lr.number}
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
            onEdit={handleEdit}
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
