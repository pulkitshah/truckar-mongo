import React, { useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { useFormik, getIn, FieldArray, FormikProvider } from "formik";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

import {
  Box,
  Button,
  Card,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { PropertyList } from "../../property-list";
import { PropertyListItem } from "../../property-list-item";
import GoogleMaps from "./google-maps";
import { lrApi } from "../../../api/lr-api";
import { Trash as TrashIcon } from "../../../icons/trash";
import { Plus as PlusIcon } from "../../../icons/plus";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";

const statusOptions = ["Canceled", "Complete", "Rejected"];

export const LrSummary = (props) => {
  const { lr, getLr, ...other } = props;
  const { user } = useAuth();
  const dispatch = useDispatch();
  const smDown = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [status, setStatus] = useState(statusOptions[0]);
  const [addresses, setAddresses] = useState({ waypoints: [] });

  let delivery = lr.delivery;
  console.log(lr);
  const align = smDown ? "vertical" : "horizontal";

  const formik = useFormik({
    initialValues: {
      id: lr.id,
      lrCharges: lr.lrCharges,
    },
    // validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      try {
        console.log(values);
        const editedLr = {
          id: lr.id,
          lrCharges: values.lrCharges,
          user: user.id,
          _version: lr._version,
        };
        console.log(editedLr);

        await lrApi.updateLr(editedLr, dispatch);
        getLr();
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

  React.useEffect(() => {
    setAddresses({ waypoints: [...addresses.waypoints] });

    // Setting Origin
    setAddresses((addresses) => ({
      ...addresses,
      ...{
        origin: delivery.loading.description,
      },
    }));

    // Setting Destination
    if (delivery.unloading) {
      setAddresses((addresses) => ({
        ...addresses,
        ...{
          destination: delivery.unloading.description,
        },
      }));
    }

    // Setting waypoints

    let waypoints = [];

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

    waypoints = waypoints.filter(
      (waypoint) => waypoint.location !== delivery.loading.description
    );
    waypoints = waypoints.filter(
      (waypoint) => waypoint.location !== delivery.unloading.description
    );

    waypoints = [
      ...new Map(waypoints.map((item) => [item.location, item])).values(),
    ];

    setAddresses({
      origin: delivery.loading.description,
      destination: delivery.unloading.description,
      waypoints: waypoints,
    });
  }, []);

  return (
    <React.Fragment>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <Card {...other}>
            <CardHeader title="LR info" />
            <Divider />
            <PropertyList>
              <PropertyListItem
                align={align}
                label="Lr No"
                value={`${lr.organisation.initials} - ${lr.lrNo}`}
              />
              <Divider />
              <Divider />
              <PropertyListItem
                align={align}
                label="LR Date"
                value={moment(lr.lrDate).format("DD/MM/YY")}
              />
              <Divider />
              <PropertyListItem
                align={align}
                label="Organisation"
                value={lr.organisation.name}
              />
              <Divider />
              <PropertyListItem
                align={align}
                label="Vehicle Number"
                value={lr.order.vehicleNumber}
              />
              <Divider />
            </PropertyList>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card {...other}>
            <CardHeader title="Order info" />
            <Divider />
            <PropertyList>
              <PropertyListItem
                align={align}
                label="Order No"
                value={lr.order.orderNo}
              />
              <Divider />
              <PropertyListItem
                align={align}
                label="Sale Date"
                value={moment(lr.order.saleDate).format("DD/MM/YY")}
              />
              <Divider />

              <PropertyListItem align={align} label="Customer">
                <Typography color="primary" variant="body2">
                  {`${lr.order.customer.name}`}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  {lr.order.customer.city.description}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  {`${lr.order.customer.mobile}`}
                </Typography>
              </PropertyListItem>
              <Divider />
            </PropertyList>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ my: 2 }} {...other}>
        <CardHeader title="Delivery details" />
        <Divider />
        <GoogleMaps sx={{ my: 2 }} addresses={addresses} />
        <PropertyListItem
          align={align}
          label="Loading From"
          value={delivery.loading.description}
        />
        <Divider />

        <PropertyListItem align={align} label="Consignor">
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
            {lr.consignor.city.description}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignor.pan && `PAN - ${lr.consignor.pan}`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignor.gstin && `GSTIN - ${lr.consignor.gstin}`}
          </Typography>
        </PropertyListItem>
        <Divider />

        <PropertyListItem
          align={align}
          label="Unloading at"
          value={delivery.unloading.description}
        />
        <Divider />

        <PropertyListItem align={align} label="Consignee">
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
            {lr.consignee.city.description}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignee.pan && `PAN - ${lr.consignee.pan}`}
          </Typography>
          <Typography color="textSecondary" variant="body2">
            {lr.consignee.gstin && `GSTIN - ${lr.consignee.gstin}`}
          </Typography>
        </PropertyListItem>
      </Card>

      {
        <Card sx={{ my: 2 }} {...other}>
          <CardHeader title="Charges" />
          <form onSubmit={formik.handleSubmit} {...props}>
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
                            sx={{ ml: 2 }}
                          >
                            <Grid item xs={4} className="col" key={index}>
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
                            <Grid item xs={3}>
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
        </Card>
      }

      {lr.descriptionOfGoods[0].description && (
        <Card sx={{ my: 2 }} {...other}>
          <CardHeader title="Description of Goods" />
          <Divider />
          <PropertyListItem align={align} label="Description">
            {lr.descriptionOfGoods.map((goodsDescription) => {
              return (
                <React.Fragment>
                  <Typography color="textSecondary" variant="body2">
                    {goodsDescription.packages &&
                      `${goodsDescription.packages} ${goodsDescription.packing} - ${goodsDescription.description}`}
                  </Typography>
                </React.Fragment>
              );
            })}
          </PropertyListItem>
          <Divider />
        </Card>
      )}

      {(lr.insuranceCompany ||
        lr.insuranceDate ||
        lr.insurancePolicyNo ||
        lr.insuranceAmount) && (
        <Card sx={{ my: 2 }} {...other}>
          <CardHeader title="Insurance Details" />
          <Divider />
          {lr.insuranceCompany && (
            <PropertyListItem
              align={align}
              label="Insurance Company"
              value={lr.insuranceCompany}
            />
          )}
          <Divider />
          {lr.insuranceDate && (
            <PropertyListItem
              align={align}
              label="Insurance Date"
              value={moment(lr.insuranceDate).format("DD/MM/YY")}
            />
          )}
          <Divider />
          {lr.insurancePolicyNo && (
            <PropertyListItem
              align={align}
              label="Insurance Policy No"
              value={lr.insurancePolicyNo}
            />
          )}
          <Divider />

          {lr.insuranceAmount && (
            <PropertyListItem
              align={align}
              label="Insurance Amount"
              value={lr.insuranceAmount}
            />
          )}
          <Divider />
        </Card>
      )}

      {(lr.fareBasis || lr.valueOfGoods || lr.chargedWeight) && (
        <Card sx={{ my: 2 }} {...other}>
          <CardHeader title="Other Details" />
          <Divider />
          {lr.fareBasis && (
            <PropertyListItem
              align={align}
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
          <Divider />

          {lr.valueOfGoods && (
            <PropertyListItem
              align={align}
              label="Value of Goods"
              value={lr.valueOfGoods}
            />
          )}
          <Divider />

          {lr.chargedWeight && (
            <PropertyListItem
              align={align}
              label="Charged Weight"
              value={lr.chargedWeight}
            />
          )}
          <Divider />
        </Card>
      )}

      {(lr.ewayBillNo || lr.ewayBillExpiryDate) && (
        <Card sx={{ my: 2 }} {...other}>
          <CardHeader title="E-Way Bill Details" />
          <Divider />
          {lr.ewayBillNo && (
            <React.Fragment>
              <PropertyListItem
                align={align}
                label="E-Way Bill No"
                value={lr.ewayBillNo}
              />
              <Divider />
            </React.Fragment>
          )}
          {lr.ewayBillExpiryDate && (
            <React.Fragment>
              <PropertyListItem
                align={align}
                label="E-Way Expiry Date"
                value={moment(lr.ewayBillExpiryDate).format("DD/MM/YY")}
              />
            </React.Fragment>
          )}
          <Divider />
        </Card>
      )}
    </React.Fragment>
  );
};

LrSummary.propTypes = {
  lr: PropTypes.object.isRequired,
};
