import React, { useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import moment from "moment";

import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useAuth } from "../../../hooks/use-auth";
import DeliveryDetails from "./delivery-details";
import SaleTypeAutocomplete from "../autocompletes/saleType-autocomplete/saleType-autocomplete";
import PartyAutocomplete from "../autocompletes/party-autocomplete/party-autocomplete";
import VehicleAutocomplete from "../autocompletes/vehicle-autocomplete/vehicle-autocomplete";
import DriverAutocomplete from "../autocompletes/driver-autocomplete/driver-autocomplete";
import GoogleMaps from "./google-maps";
import { orderApi } from "../../../api/order-api";
import { useDispatch } from "../../../store";
import { deliveryApi } from "../../../api/delivery-api";
import { sendOrderConfirmationMessageToOwner } from "../../../utils/whatsapp";

export const OrderCreateForm = (props) => {
  const order = props.order || {};
  const router = useRouter();
  const dispatch = useDispatch();
  const { account } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [driver, setDriver] = useState();
  const [addresses, setAddresses] = useState({ waypoints: [] });

  const [purchaseType, setPurchaseType] = React.useState("quantity");

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
    orderNo: Yup.number()
      .required("Order No is required")
      .test({
        name: "Checking Duplicate Order No",
        exclusive: false,
        params: {},
        message: "Order No cannot be repeated in the fiscal year of sale date",
        test: async function (value) {
          try {
            const response = await orderApi.validateDuplicateOrderNo({
              orderNo: value,
              saleDate: this.parent.saleDate,
              account: account._id,
            });
            // console.log(response);
            return response.data;
          } catch (error) {
            console.log(error);
          }
        },
      }),
    saleDate: Yup.object().required("Sale Date is required"),
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
    saleRate: Yup.number().required("Sale Rate is required"),
  };

  if (typeof selectedVehicle === "object" && selectedVehicle !== null) {
  } else {
    validationShape.transporter = Yup.object().required(
      "Transporter is required"
    );
    validationShape.purchaseType = Yup.string().required(
      "Purchase is required"
    );
    validationShape.purchaseRate = Yup.number().required(
      "Purchase Rate is required"
    );
  }

  validationShape.deliveries = Yup.array().of(
    Yup.object().shape({
      loading: Yup.object()
        .required("Loading Point is Required")
        .test({
          name: "Checking Blank JSON Object",
          exclusive: false,
          params: {},
          message: "Loading is Required",
          test: function (value) {
            try {
              console.log(value);
              return !(Object.keys(value).length === 0);
            } catch (error) {
              console.log(error);
            }
          },
        }), // these constraints take precedence
      unloading: Yup.object()
        .required("Unloading Point is Required")
        .test({
          name: "Checking Blank JSON Object",
          exclusive: false,
          params: {},
          message: "Unloading is Required",
          test: function (value) {
            try {
              console.log(value);
              return !(Object.keys(value).length === 0);
            } catch (error) {
              console.log(error);
            }
          },
        }), // these constraints take precedence
    })
  );
  const formik = useFormik({
    initialValues: {
      account: account,
      orderNo: order.orderNo || "",
      saleDate: order.saleDate || moment(),
      customer: order.customer || null,
      vehicle: order.vehicle || null,
      driver: order.driver || null,
      transporter: order.transporter || "",
      saleType: order.saleType
        ? order.saleType
        : {
            value: "quantity",
            unit: "MT",
            label: "Per Ton",
          },
      saleRate: order.saleRate || "",
      saleAdvance: order.saleAdvance || "",
      minimumSaleGuarantee: order.minimumSaleGuarantee || null,
      purchaseType: order.purchaseType || purchaseType,
      purchaseRate: order.purchaseRate || "",
      purchaseAdvance: order.purchaseAdvance || "",
      minimumPurchaseGuarantee: order.minimumPurchaseGuarantee || null,
      deliveries: [
        {
          _id: uuidv4(),
          loading: {},
          unloading: {},
          billQuantity: "",
          unloadingQuantity: "",
        },
      ],
    },
    validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      console.log(values);
      try {
        const newOrder = {
          orderNo: parseInt(values.orderNo),
          saleDate: values.saleDate.format(),
          customer: values.customer,
          saleRate: values.saleRate,
          saleType: values.saleType,
          deliveries: values.deliveries,
          orderExpenses: account.orderExpensesSettings,
          account: account,
        };

        if (values.minimumSaleGuarantee)
          newOrder.minimumSaleGuarantee = values.minimumSaleGuarantee;

        if (values.saleAdvance) newOrder.saleAdvance = values.saleAdvance;

        if (typeof selectedVehicle === "object" && selectedVehicle !== null) {
          newOrder.vehicle = values.vehicle;
          newOrder.vehicleNumber = values.vehicle.vehicleNumber.toUpperCase();
          if (values.driver) {
            newOrder.driver = values.driver;
          }
          newOrder.transporter = null;
          newOrder.purchaseRate = null;
          newOrder.purchaseType = null;
          if (values.minimumPurchaseGuarantee)
            newOrder.minimumPurchaseGuarantee = null;
          newOrder.purchaseAdvance = null;
        } else {
          newOrder.vehicle = null;
          newOrder.vehicleNumber = values.vehicle.toUpperCase();
          newOrder.driver = null;
          newOrder.transporter = values.transporter;
          newOrder.purchaseRate = values.purchaseRate;
          newOrder.purchaseType = values.purchaseType;
          if (values.minimumPurchaseGuarantee)
            newOrder.minimumPurchaseGuarantee = values.minimumPurchaseGuarantee;
          if (values.purchaseAdvance)
            newOrder.purchaseAdvance = values.purchaseAdvance;
        }

        let { data } = await orderApi.createOrder(newOrder, dispatch);
        console.log(data);

        toast.success("Order created!");
        router.push("/dashboard/orders");
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
    <form onSubmit={formik.handleSubmit} {...props}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={3} xs={12}>
              <Typography variant="h6">Basic details</Typography>
            </Grid>
            <Grid item md={9} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.orderNo && formik.errors.orderNo
                    )}
                    fullWidth
                    helperText={formik.touched.orderNo && formik.errors.orderNo}
                    label="Order No"
                    name="orderNo"
                    onBlur={formik.handleBlur}
                    onChange={(event) => {
                      formik.setFieldValue(`orderNo`, event.target.value);
                    }}
                    value={formik.values.orderNo}
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <DatePicker
                    id="saleDate"
                    name="saleDate"
                    label="Sale date"
                    showTodayButton={true}
                    inputFormat="DD/MM/YYYY"
                    value={formik.values.saleDate}
                    onClick={() => setFieldTouched("end")}
                    onChange={(date) =>
                      formik.setFieldValue("saleDate", moment(date))
                    }
                    slotProps={{
                      textField: {
                        helperText:
                          formik.touched.saleDate && formik.errors.saleDate,
                        error: Boolean(
                          formik.touched.saleDate && formik.errors.saleDate
                        ),
                      },
                    }}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <PartyAutocomplete
                    errors={formik.errors}
                    touched={formik.touched}
                    setFieldValue={formik.setFieldValue}
                    handleBlur={formik.handleBlur}
                    type="customer"
                    account={account}
                    formik={formik}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid sx={{ mb: 6 }} item md={3} xs={12}>
              <Typography sx={{ mb: 3 }} variant="h6">
                Delivery details
              </Typography>
              <GoogleMaps addresses={addresses} />
            </Grid>
            <Grid item md={9} xs={12}>
              <DeliveryDetails formik={formik} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={3} xs={12}>
              <Typography variant="h6">Vehicle details</Typography>
            </Grid>
            <Grid item md={9} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <VehicleAutocomplete
                    errors={formik.errors}
                    touched={formik.touched}
                    setFieldValue={formik.setFieldValue}
                    handleBlur={formik.handleBlur}
                    setSelectedVehicle={setSelectedVehicle}
                    setDriver={setDriver}
                    account={account}
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  {typeof selectedVehicle === "object" &&
                  selectedVehicle !== null ? (
                    <DriverAutocomplete
                      errors={formik.errors}
                      touched={formik.touched}
                      setFieldValue={formik.setFieldValue}
                      handleBlur={formik.handleBlur}
                      setSelectedVehicle={setSelectedVehicle}
                      setDriver={setDriver}
                      account={account}
                      values={formik.values}
                      formik={formik}
                    />
                  ) : (
                    selectedVehicle !== null && (
                      <PartyAutocomplete
                        errors={formik.errors}
                        touched={formik.touched}
                        setFieldValue={formik.setFieldValue}
                        handleBlur={formik.handleBlur}
                        type="transporter"
                        account={account}
                        formik={formik}
                      />
                    )
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={3} xs={12}>
              <Typography variant="h6">Sale details</Typography>
            </Grid>
            <Grid item md={9} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={3} xs={12}>
                  <SaleTypeAutocomplete formik={formik} />
                </Grid>
                <Grid item md={3} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.saleRate && formik.errors.saleRate
                    )}
                    variant="outlined"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    helperText={
                      formik.touched.saleRate && formik.errors.saleRate
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">{`Rs`}</InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          {formik.values.saleType.value === ("fixed" || "time")
                            ? ""
                            : `/ ${formik.values.saleType.unit}`}
                        </InputAdornment>
                      ),
                    }}
                    id="saleRate"
                    name="saleRate"
                    label="Sale Rate"
                    fullWidth
                  />
                </Grid>
                {formik.values.saleType.value === "quantity" && (
                  <Grid item md={3} xs={6}>
                    <TextField
                      error={Boolean(
                        formik.touched.minimumSaleGuarantee &&
                          formik.errors.minimumSaleGuarantee
                      )}
                      variant="outlined"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      helperText={
                        formik.touched.minimumSaleGuarantee &&
                        formik.errors.minimumSaleGuarantee
                      }
                      id="minimumSaleGuarantee"
                      name="minimumSaleGuarantee"
                      label="Min. Guarantee"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {`${formik.values.saleType.unit}`}
                          </InputAdornment>
                        ),
                      }}
                      fullWidth
                    />
                  </Grid>
                )}
                <Grid item md={3} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.saleAdvance && formik.errors.saleAdvance
                    )}
                    variant="outlined"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    helperText={
                      formik.touched.saleAdvance && formik.errors.saleAdvance
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">{`Rs`}</InputAdornment>
                      ),
                    }}
                    id="saleAdvance"
                    name="saleAdvance"
                    label="Sale Advance"
                    fullWidth
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {!(typeof selectedVehicle === "object") && selectedVehicle !== null && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={3} xs={12}>
                <Typography variant="h6">Purchase details</Typography>
              </Grid>
              <Grid item md={9} xs={12}>
                <Grid container spacing={3}>
                  <Grid item md={3} xs={12}>
                    <TextField
                      error={Boolean(
                        formik.touched.purchaseType &&
                          formik.errors.purchaseType
                      )}
                      onBlur={formik.handleBlur}
                      name="purchaseType"
                      label="Purchase Type"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      id="purchaseType"
                      select
                      value={purchaseType}
                      onChange={(event) => {
                        setPurchaseType(event.target.value);
                        event.target.value;
                        formik.setFieldValue(
                          "purchaseType",
                          event.target.value
                        );
                      }}
                      SelectProps={{
                        native: true,
                      }}
                      helperText="Please select purchase type"
                      variant="outlined"
                    >
                      {purchaseTypes.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value === "quantity"
                            ? `Per ${formik.values.saleType.unit}`
                            : option.label}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item md={3} xs={12}>
                    <TextField
                      error={Boolean(
                        formik.touched.purchaseRate &&
                          formik.errors.purchaseRate
                      )}
                      variant="outlined"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      helperText={
                        formik.touched.purchaseRate &&
                        formik.errors.purchaseRate
                      }
                      id="purchaseRate"
                      name="purchaseRate"
                      label="Purchase Rate"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">{`Rs`}</InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            {formik.values.purchaseType === ("fixed" || "time")
                              ? ""
                              : `/ ${formik.values.saleType.unit}`}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  {purchaseType === "quantity" && (
                    <Grid item md={3} xs={6}>
                      <TextField
                        error={Boolean(
                          formik.touched.minimumPurchaseGuarantee &&
                            formik.errors.minimumPurchaseGuarantee
                        )}
                        variant="outlined"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        helperText={
                          formik.touched.minimumPurchaseGuarantee &&
                          formik.errors.minimumPurchaseGuarantee
                        }
                        id="minimumPurchaseGuarantee"
                        name="minimumPurchaseGuarantee"
                        label="Min. Load Guarantee"
                        fullWidth
                      />
                    </Grid>
                  )}
                  <Grid item md={3} xs={12}>
                    <TextField
                      error={Boolean(
                        formik.touched.purchaseAdvance &&
                          formik.errors.purchaseAdvance
                      )}
                      variant="outlined"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      helperText={
                        formik.touched.purchaseAdvance &&
                        formik.errors.purchaseAdvance
                      }
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">{`Rs`}</InputAdornment>
                        ),
                      }}
                      id="purchaseAdvance"
                      name="purchaseAdvance"
                      label="Purchase Advance"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          mx: -1,
          mb: -1,
          mt: 3,
        }}
      >
        <Button
          color="error"
          sx={{
            m: 1,
            mr: "auto",
          }}
        >
          Delete
        </Button>
        <Button sx={{ m: 1 }} variant="outlined">
          Cancel
        </Button>
        <Button sx={{ m: 1 }} type="submit" variant="contained">
          Create
        </Button>
      </Box>
    </form>
  );
};
