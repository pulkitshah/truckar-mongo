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

export const getOrderUnit = (order) => {
  switch (order.saleType.value) {
    case "quantity":
      return `${order.saleType.unit}`;
      break;
    case "fixed":
      return `(Fixed)`;
      break;
    case "time":
      return `${order.saleType.unit}`;
      break;
    default:
      break;
  }
};

const OrderPreview = (props) => {
  const { lgUp, onEdit, order, gridApi } = props;
  const { user, account } = useAuth();
  const align = lgUp ? "horizontal" : "vertical";
  const dispatch = useDispatch();

  console.log(user);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      _id: order._id,
      orderExpenses: order.orderExpenses ? order.orderExpenses : [],
    },
    onSubmit: async (values, helpers) => {
      try {
        console.log(values);
        const editedOrder = {
          _id: values._id,
          orderExpenses: values.orderExpenses,
          account: account._id,
          _version: order._version,
        };
        console.log(editedOrder);

        await orderApi.updateOrder(editedOrder, dispatch);
        gridApi.refreshInfiniteCache();
        toast.success("Expenses updated!");
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
          borderRadius: 1,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ mt: 3 }} variant="h6">
          Order Details
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
          <Button
            onClick={() => {
              sendOrderConfirmationMessageToOwner(order, user);
            }}
            size="small"
            sx={{ pt: 3 }}
          >
            Whatsapp
          </Button>
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />

      <PropertyList>
        <PropertyListItem
          align={align}
          disableGutters
          label="Order No"
          value={`${order.orderNo}`}
        />
        <PropertyListItem
          align={align}
          disableGutters
          label="Sale Date"
          value={moment(order.saleDate).format("DD/MM/YY")}
        />
        <Box
          sx={{
            display: "flex",
            flex: 1,
            justifyContent: "space-between",
          }}
        >
          <PropertyListItem align={align} disableGutters label="Customer">
            <Typography color="primary" variant="body2">
              {order.customer.name}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {order.customer.mobile}
            </Typography>
            <Typography color="textSecondary" variant="body2">
              {order.customer.city.description}
            </Typography>
          </PropertyListItem>
          <Button
            disabled={true}
            onClick={() => {
              sendOrderConfirmationMessageToOwner(order, account);
            }}
            size="small"
            sx={{ pt: 3 }}
          >
            Whatsapp
          </Button>
        </Box>
        <PropertyListItem
          align={align}
          disableGutters
          label="Vehicle Number"
          value={order.vehicleNumber}
        />

        <Divider sx={{ my: 3 }} />

        <Typography sx={{ my: 3 }} variant="h6">
          Deliveries
        </Typography>

        <Box
          sx={{
            width: "100%",
          }}
        >
          <DeliveryDetailsGrid order={order} gridApi={gridApi} />
        </Box>
        {!Boolean(order.vehicle) && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box
              sx={{
                display: "flex",
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <PropertyListItem
                align={align}
                disableGutters
                label="Transporter"
              >
                <Typography color="primary" variant="body2">
                  {order.transporter.name}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  {order.transporter.mobile}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  {order.transporter.city.description}
                </Typography>
              </PropertyListItem>
              <Button
                disabled={true}
                onClick={() => {
                  sendOrderConfirmationMessageToOwner(order, user);
                }}
                size="small"
                sx={{ pt: 3 }}
              >
                Whatsapp
              </Button>
            </Box>
          </>
        )}
        {order.driver && (
          <>
            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: "flex",
                flex: 1,
                justifyContent: "space-between",
              }}
            >
              <PropertyListItem align={align} disableGutters label="Driver">
                <Typography color="primary" variant="body2">
                  {order.driver.name}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  {order.driver.mobile}
                </Typography>
              </PropertyListItem>
              <Button
                disabled={true}
                onClick={() => {
                  sendOrderConfirmationMessageToOwner(order, account);
                }}
                size="small"
                sx={{ pt: 3 }}
              >
                Whatsapp
              </Button>
            </Box>
          </>
        )}
      </PropertyList>
      <Divider sx={{ my: 3 }} />

      <Typography sx={{ my: 3 }} variant="h6">
        Sale Details
      </Typography>

      <PropertyList>
        <PropertyListItem
          align={align}
          disableGutters
          label="Sale Rate"
          value={`Rs ${order.saleRate}/ ${getOrderUnit(order)}`}
        />
        {order.minimumSaleGuarantee ? (
          <PropertyListItem
            align={align}
            disableGutters
            label="Min Sale Guarantee"
            value={`${order.minimumSaleGuarantee} ${order.saleType.unit}`}
          />
        ) : null}
        {order.saleAdvance && (
          <PropertyListItem
            align={align}
            disableGutters
            label="Sale Advance"
            value={`${dataFormatter(order.saleAdvance, "currency")}`}
          />
        )}
      </PropertyList>
      <Divider sx={{ my: 3 }} />

      {(!(typeof order.vehicle === "object") || order.vehicle === null) && (
        <React.Fragment>
          <Typography sx={{ my: 3 }} variant="h6">
            Purchase Details
          </Typography>
          <PropertyList>
            <PropertyListItem
              align={align}
              disableGutters
              label="Purchase Rate"
              value={`Rs ${order.purchaseRate}/ ${getOrderUnit(order)}`}
            />
            {order.minimumPurchaseGuarantee && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Min Purchase Guarantee"
                value={`${order.minimumPurchaseGuarantee} ${order.saleType.unit}`}
              />
            )}
            {order.purchaseAdvance && (
              <PropertyListItem
                align={align}
                disableGutters
                label="Purchase Advance"
                value={`${dataFormatter(order.purchaseAdvance, "currency")}`}
              />
            )}
          </PropertyList>
          <Divider sx={{ my: 3 }} />
        </React.Fragment>
      )}

      {
        <form onSubmit={formik.handleSubmit} {...props}>
          <Typography sx={{ mt: 6, mb: 4 }} variant="h6">
            Other Expenses (Non-Billable)
          </Typography>
          <FormikProvider value={formik}>
            <FieldArray name="orderExpenses" error={formik.errors}>
              {({ remove, push }) => (
                <Box sx={{ mt: 4 }} {...props}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      {formik.values.orderExpenses.length > 0 &&
                        formik.values.orderExpenses.map((delivery, index) => {
                          const orderExpenseName = `orderExpenses[${index}]`;
                          const touchedOrderExpenseName = getIn(
                            formik.touched,
                            orderExpenseName
                          );
                          const errorOrderExpenseName = getIn(
                            formik.errors,
                            orderExpenseName
                          );

                          const orderExpenseAmount = `orderExpenses[${index}].orderExpenseAmount`;
                          const touchedOrderExpenseAmount = getIn(
                            formik.touched,
                            orderExpenseAmount
                          );
                          const errorOrderExpenseAmount = getIn(
                            formik.errors,
                            orderExpenseAmount
                          );
                          return (
                            <React.Fragment>
                              <Grid container spacing={3}>
                                {index > 0 && <Divider sx={{ mb: 2 }} />}
                                <Grid
                                  item
                                  xs={6}
                                  sx={{ mt: 2 }}
                                  className="col"
                                  key={index}
                                >
                                  <TextField
                                    helperText={
                                      touchedOrderExpenseName &&
                                      errorOrderExpenseName
                                        ? errorOrderExpenseName
                                        : ""
                                    }
                                    error={Boolean(
                                      touchedOrderExpenseName &&
                                        errorOrderExpenseName
                                    )}
                                    variant="outlined"
                                    onChange={(event) => {
                                      formik.setFieldValue(
                                        `orderExpenses[${index}].orderExpenseName`,
                                        event.target.value
                                      );
                                    }}
                                    onBlur={formik.handleBlur}
                                    _id="orderExpenseName"
                                    name="orderExpenseName"
                                    label="Expense Name"
                                    fullWidth
                                    value={
                                      formik.values.orderExpenses[index]
                                        .orderExpenseName
                                    }
                                  />
                                </Grid>
                                <Grid
                                  item
                                  xs={4}
                                  sx={{ mt: 2 }}
                                  className="col"
                                >
                                  <TextField
                                    value={
                                      formik.values.orderExpenses[index]
                                        .orderExpenseAmount
                                        ? formik.values.orderExpenses[index]
                                            .orderExpenseAmount
                                        : null
                                    }
                                    variant="outlined"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    _id={orderExpenseAmount}
                                    name={orderExpenseAmount}
                                    helperText={
                                      touchedOrderExpenseAmount &&
                                      errorOrderExpenseAmount
                                        ? errorOrderExpenseAmount
                                        : ""
                                    }
                                    error={Boolean(
                                      touchedOrderExpenseAmount &&
                                        errorOrderExpenseAmount
                                    )}
                                    label="Amount"
                                    fullWidth
                                  />
                                </Grid>
                                <Grid item sx={{ mt: 3 }} className="col">
                                  <Button
                                    disabled={index < 1}
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
                              orderExpenseName: "",
                              orderExpenseAmount: 0,
                              isActive: true,
                            });
                          }}
                        >
                          Add Expense
                        </Button>
                        <Button
                          color="secondary"
                          type="submit"
                          variant="contained"
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </FieldArray>
          </FormikProvider>
        </form>
      }
    </>
  );
};

const OrderForm = (props) => {
  const { onOpen, onCancel, order, gridApi } = props;
  const dispatch = useDispatch();
  const { account } = useAuth();
  const [selectedVehicle, setSelectedVehicle] = useState(
    order.vehicle ? order.vehicle : order.vehicleNumber
  );
  const [driver, setDriver] = useState();
  const [addresses, setAddresses] = useState({ waypoints: [] });

  const [purchaseType, setPurchaseType] = React.useState(
    order.purchaseType ? order.purchaseType : order.saleType.value
  );

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
            if (value === order.orderNo) {
              return true;
            }
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
    saleRate: Yup.string().required("Sale Rate is required"),
  };

  if (typeof selectedVehicle === "object" && selectedVehicle !== null) {
  } else {
    validationShape.transporter = Yup.object().required(
      "Transporter is required"
    );
    validationShape.purchaseType = Yup.string().required(
      "Purchase is required"
    );
    validationShape.purchaseRate = Yup.string().required(
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
      _id: order._id,
      orderNo: order.orderNo || "",
      saleDate: moment(order.saleDate) || moment(),
      customer: order.customer || null,
      vehicle: order.vehicle ? order.vehicle : order.vehicleNumber,
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
      purchaseType: purchaseType,
      purchaseRate: order.purchaseRate || "",
      purchaseAdvance: order.purchaseAdvance || "",
      minimumPurchaseGuarantee: order.minimumPurchaseGuarantee || null,
      deliveries: order.deliveries || [
        {
          _id: uuidv4(),
          loading: "",
          unloading: "",
          billQuantity: "",
          unloadingQuantity: "",
        },
      ],
      _version: order._version,
    },
    validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      try {
        const editedOrder = {
          _id: values._id,
          orderNo: parseInt(values.orderNo),
          saleDate: values.saleDate.format(),
          customer: values.customer._id,
          saleRate: parseFloat(values.saleRate),
          saleType: values.saleType,
          account: account._id,
          deliveries: values.deliveries,
          _version: values._version,
        };

        if (typeof selectedVehicle === "object" && selectedVehicle !== null) {
          // editedOrder.vehicle = values.vehicle;
          editedOrder.vehicle = values.vehicle._id;
          editedOrder.vehicleNumber =
            values.vehicle.vehicleNumber.toUpperCase();
          if (values.driver) {
            // editedOrder.driver = values.driver;
            editedOrder.driver = values.driver._id;
          }
        } else {
          editedOrder.vehicle = null;
          editedOrder.driver = null;
          editedOrder.vehicleNumber = values.vehicle.toUpperCase();
          // editedOrder.transporter = values.transporter;
          editedOrder.transporter = values.transporter._id;
          editedOrder.purchaseRate = parseFloat(values.purchaseRate);
          editedOrder.purchaseType = values.purchaseType;
          if (values.minimumPurchaseGuarantee)
            editedOrder.minimumPurchaseGuarantee = parseFloat(
              values.minimumPurchaseGuarantee
            );
        }

        if (values.minimumSaleGuarantee)
          editedOrder.minimumSaleGuarantee = parseFloat(
            values.minimumSaleGuarantee
          );

        if (values.saleAdvance)
          editedOrder.saleAdvance = parseFloat(values.saleAdvance);
        if (values.purchaseAdvance)
          editedOrder.purchaseAdvance = parseFloat(values.purchaseAdvance);

        console.log(editedOrder);

        let { data } = await orderApi.updateOrder(editedOrder, dispatch);
        console.log(data);

        onOpen(data, gridApi);
        gridApi.refreshInfiniteCache();
        toast.success("Order updated!");
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
            borderRadius: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
            mb: 2,
          }}
        >
          <Typography variant="overline" sx={{ mr: 2 }} color="textSecondary">
            Order
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
        <TextField
          sx={{ my: 2 }}
          error={Boolean(formik.touched.orderNo && formik.errors.orderNo)}
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
        <DatePicker
          sx={{ my: 2 }}
          _id="saleDate"
          name="saleDate"
          label="Sale date"
          showTodayButton={true}
          inputFormat="DD/MM/YYYY"
          value={formik.values.saleDate}
          onClick={() => setFieldTouched("end")}
          onChange={(date) => formik.setFieldValue("saleDate", moment(date))}
          slotProps={{
            textField: {
              helperText: formik.touched.saleDate && formik.errors.saleDate,
              error: Boolean(formik.touched.saleDate && formik.errors.saleDate),
            },
          }}
          renderInput={(params) => <TextField fullWidth {...params} />}
        />
        <PartyAutocomplete
          sx={{ my: 2 }}
          type="customer"
          account={account}
          formik={formik}
        />
        <Divider sx={{ my: 3 }} />

        <Typography sx={{ my: 3 }} variant="h6">
          Delivery details
        </Typography>
        {/* <GoogleMaps sx={{ my: 2 }} addresses={addresses} /> */}
        <DeliveryDetails sx={{ my: 2 }} formik={formik} />

        <Divider sx={{ my: 3 }} />
        <Typography sx={{ my: 3 }} variant="h6">
          Vehicle details
        </Typography>
        <VehicleAutocomplete
          currentValue={order.vehicle ? order.vehicle : order.vehicleNumber}
          sx={{ my: 2 }}
          errors={formik.errors}
          touched={formik.touched}
          setFieldValue={formik.setFieldValue}
          handleBlur={formik.handleBlur}
          setSelectedVehicle={setSelectedVehicle}
          setDriver={setDriver}
          account={account}
        />
        {typeof selectedVehicle === "object" && selectedVehicle !== null ? (
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
            driver={formik.values.driver}
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
        <Divider sx={{ my: 3 }} />
        <Typography sx={{ my: 3 }} variant="h6">
          Sale details
        </Typography>
        <SaleTypeAutocomplete formik={formik} />
        <TextField
          sx={{ my: 2 }}
          error={Boolean(formik.touched.saleRate && formik.errors.saleRate)}
          variant="outlined"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.saleRate && formik.errors.saleRate}
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
          _id="saleRate"
          name="saleRate"
          label="Sale Rate"
          fullWidth
          value={formik.values.saleRate}
        />
        {formik.values.saleType.value === "quantity" && (
          <TextField
            sx={{ mb: 2 }}
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
            _id="minimumSaleGuarantee"
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
            value={formik.values.minimumSaleGuarantee}
          />
        )}

        <TextField
          error={Boolean(
            formik.touched.saleAdvance && formik.errors.saleAdvance
          )}
          variant="outlined"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.saleAdvance && formik.errors.saleAdvance}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">{`Rs`}</InputAdornment>
            ),
          }}
          _id="saleAdvance"
          name="saleAdvance"
          label="Sale Advance"
          fullWidth
          value={formik.values.saleAdvance}
        />

        {!(typeof selectedVehicle === "object") && selectedVehicle !== null && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography sx={{ my: 3 }} variant="h6">
              Purchase details
            </Typography>
            <TextField
              sx={{ mb: 2 }}
              error={Boolean(
                formik.touched.purchaseType && formik.errors.purchaseType
              )}
              onBlur={formik.handleBlur}
              name="purchaseType"
              label="Purchase Type"
              InputLabelProps={{
                shrink: true,
              }}
              fullWidth
              _id="purchaseType"
              select
              value={purchaseType}
              onChange={(event) => {
                setPurchaseType(event.target.value);
                event.target.value;
                formik.setFieldValue("purchaseType", event.target.value);
              }}
              SelectProps={{
                native: true,
              }}
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

            <TextField
              sx={{ mb: 2 }}
              error={Boolean(
                formik.touched.purchaseRate && formik.errors.purchaseRate
              )}
              variant="outlined"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText={
                formik.touched.purchaseRate && formik.errors.purchaseRate
              }
              _id="purchaseRate"
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
              value={formik.values.purchaseRate}
            />

            {purchaseType === "quantity" && (
              <TextField
                sx={{ mb: 2 }}
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
                _id="minimumPurchaseGuarantee"
                name="minimumPurchaseGuarantee"
                label="Min. Load Guarantee"
                fullWidth
                value={formik.values.minimumPurchaseGuarantee}
              />
            )}
            <TextField
              error={Boolean(
                formik.touched.purchaseAdvance && formik.errors.purchaseAdvance
              )}
              variant="outlined"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText={
                formik.touched.purchaseAdvance && formik.errors.purchaseAdvance
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">{`Rs`}</InputAdornment>
                ),
              }}
              _id="purchaseAdvance"
              name="purchaseAdvance"
              label="Purchase Advance"
              fullWidth
              value={formik.values.purchaseAdvance}
            />
          </>
        )}
        <Button color="error" sx={{ mt: 3 }}>
          Delete order
        </Button>
      </form>
    </>
  );
};

const OrderDrawerDesktop = styled(Drawer)({
  width: 600,
  flexShrink: 0,
  "& .MuiDrawer-paper": {
    position: "relative",
    width: 600,
  },
});

const OrderDrawerMobile = styled(Drawer)({
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

export const OrderDrawer = (props) => {
  const { containerRef, onOpen, onClose, open, order, gridApi, ...other } =
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
  // content if an order is not passed.
  const content = order ? (
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
          {order.number}
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
          <OrderPreview
            onApprove={onClose}
            onEdit={handleEdit}
            onReject={onClose}
            order={order}
            lgUp={lgUp}
            gridApi={gridApi}
          />
        ) : (
          <OrderForm
            onOpen={onOpen}
            onCancel={handleCancel}
            order={order}
            gridApi={gridApi}
          />
        )}
      </Box>
    </>
  ) : null;

  if (lgUp) {
    return (
      <OrderDrawerDesktop
        anchor="right"
        open={open}
        SlideProps={{ container: containerRef?.current }}
        variant="persistent"
        {...other}
      >
        {content}
      </OrderDrawerDesktop>
    );
  }

  return (
    <OrderDrawerMobile
      anchor="right"
      ModalProps={{ container: containerRef?.current }}
      onClose={onClose}
      open={open}
      SlideProps={{ container: containerRef?.current }}
      variant="temporary"
      {...other}
    >
      {content}
    </OrderDrawerMobile>
  );
};

OrderDrawer.propTypes = {
  containerRef: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  order: PropTypes.object,
};
