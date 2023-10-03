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
import OrganisationAutocomplete from "../autocompletes/organisation-autcomplete/organisation-autocomplete";
import GoogleMaps from "./google-maps";
import { lrApi } from "../../../api/lr-api";
import { useDispatch } from "../../../store";
import GoodsDescriptionDetails from "./goods-description-details";
import { deliveryApi } from "../../../api/delivery-api";

export const LrCreateForm = ({ order, deliveryId, lr = {} }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
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
    organisation: Yup.object().nullable().required("Organisation is required"),
    lrDate: Yup.object().required("LR Date is required"),
    lrNo: Yup.number().required("LR No is required"),
  };

  validationShape.deliveryDetails = Yup.array().of(
    Yup.object().shape({
      loading: Yup.object().required("Loading Point is Required"), // these constraints take precedence
      unloading: Yup.object().required("Unloading Point is Required"), // these constraints take precedence
    })
  );

  let delivery = order.deliveries.find(
    (delivery) => delivery.id === deliveryId
  );

  const formik = useFormik({
    initialValues: {
      organisation: lr.organisation || "",
      lrDate: lr.lrDate || moment(),
      lrNo: lr.lrNo || "",
      deliveryDetails: [delivery],
      deliveryId: deliveryId,
      saleType: order.saleType
        ? JSON.parse(order.saleType)
        : {
            value: "quantity",
            unit: "MT",
            label: "Per Ton",
          },
      // LR
      descriptionOfGoods: [
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
      insuranceDate: lr.insuranceDate || null,
      insurancePolicyNo: lr.insurancePolicyNo || null,
      insuranceAmount: lr.insuranceAmount || null,
      ewayBillNo: lr.ewayBillNo || null,
      ewayBillExpiryDate: lr.ewayBillExpiryDate || null,
      gstPayableBy: lr.gstPayableBy || "consignor",
    },
    // validationSchema: Yup.object().shape(validationShape),
    onSubmit: async (values, helpers) => {
      try {
        console.log(values);
        const newLr = {
          lrFormat: values.lrFormat,
          lrNo: parseInt(values.lrNo),
          lrDate: values.lrDate.format(),
          orderId: order.id,
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
          lrFormat: user.lrFormat,
          lrCharges: JSON.stringify(user.lrSettings[0].lrCharges),
          user: user.id,
        };

        console.log(newLr);

        let lr = await lrApi.createLr(newLr, dispatch);
        await deliveryApi.updateDelivery(
          {
            id: delivery.id,
            lrId: lr.id,
            _version: delivery._version,
          },
          dispatch
        );

        toast.success("LR (Lorry Receipt) created!");
        router.push("/dashboard/lrs");
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
    <form onSubmit={formik.handleSubmit}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Basic details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <OrganisationAutocomplete formik={formik} user={user} />
                </Grid>
                <Grid item md={4} xs={12}>
                  <DatePicker
                    id="lrDate"
                    name="lrDate"
                    label="LR date"
                    showTodayButton={true}
                    inputFormat="DD/MM/YYYY"
                    value={formik.values.lrDate}
                    onClick={() => setFieldTouched("end")}
                    onChange={(date) =>
                      formik.setFieldValue("lrDate", moment(date))
                    }
                    slotProps={{
                      textField: {
                        helperText:
                          formik.touched.lrDate && formik.errors.lrDate,
                        error: Boolean(
                          formik.touched.lrDate && formik.errors.lrDate
                        ),
                      },
                    }}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
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
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid sx={{ mb: 6 }} item md={4} xs={12}>
              <Typography sx={{ mb: 3 }} variant="h6">
                Delivery details
              </Typography>
              <GoogleMaps addresses={addresses} />
            </Grid>
            <Grid item md={8} xs={12}>
              <DeliveryDetails formik={formik} order={order} user={user} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Description of Goods</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <GoodsDescriptionDetails formik={formik} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Dimensions</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
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
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Insurance Details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={3} xs={12}>
                  <TextField
                    fullWidth
                    align="right"
                    inputProps={{ "aria-label": "naked" }}
                    error={Boolean(
                      formik.touched.insuranceCompany &&
                        formik.errors.insuranceCompany
                    )}
                    onBlur={formik.handleBlur}
                    helperText={
                      formik.touched.insuranceCompany &&
                      formik.errors.insuranceCompany
                    }
                    id="insuranceCompany"
                    name="insuranceCompany"
                    label="Insurance Co."
                    value={formik.values.insuranceCompany}
                    onChange={formik.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={3} xs={12}>
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
                          formik.touched.insuranceDate &&
                          formik.errors.insuranceDate,
                        error: Boolean(
                          formik.touched.insuranceDate &&
                            formik.errors.insuranceDate
                        ),
                      },
                    }}
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <TextField
                    fullWidth
                    align="right"
                    inputProps={{ "aria-label": "naked" }}
                    error={Boolean(
                      formik.touched.insurancePolicyNo &&
                        formik.errors.insurancePolicyNo
                    )}
                    onBlur={formik.handleBlur}
                    helperText={
                      formik.touched.insurancePolicyNo &&
                      formik.errors.insurancePolicyNo
                    }
                    id="insurancePolicyNo"
                    name="insurancePolicyNo"
                    label="Insurance Policy No"
                    value={formik.values.insurancePolicyNo}
                    onChange={formik.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={3} xs={12}>
                  <TextField
                    fullWidth
                    align="right"
                    inputProps={{ "aria-label": "naked" }}
                    error={Boolean(
                      formik.touched.insuranceAmount &&
                        formik.errors.insuranceAmount
                    )}
                    onBlur={formik.handleBlur}
                    helperText={
                      formik.touched.insuranceAmount &&
                      formik.errors.insuranceAmount
                    }
                    id="insuranceAmount"
                    name="insuranceAmount"
                    label="Insurance Aount"
                    value={formik.values.insuranceAmount}
                    onChange={formik.handleChange}
                    variant="outlined"
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
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Other details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <TextField
                    error={Boolean(
                      formik.touched.fareBasis && formik.errors.fareBasis
                    )}
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
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
                    fullWidth
                    align="right"
                    inputProps={{ "aria-label": "naked" }}
                    error={Boolean(
                      formik.touched.valueOfGoods && formik.errors.valueOfGoods
                    )}
                    onBlur={formik.handleBlur}
                    helperText={
                      formik.touched.valueOfGoods && formik.errors.valueOfGoods
                    }
                    id="valueOfGoods"
                    name="valueOfGoods"
                    label="Value Of Goods"
                    value={formik.values.valueOfGoods}
                    onChange={formik.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
                    fullWidth
                    align="right"
                    inputProps={{ "aria-label": "naked" }}
                    error={Boolean(
                      formik.touched.chargedWeight &&
                        formik.errors.chargedWeight
                    )}
                    onBlur={formik.handleBlur}
                    helperText={
                      formik.touched.chargedWeight &&
                      formik.errors.chargedWeight
                    }
                    id="chargedWeight"
                    name="chargedWeight"
                    label="Charged Weight"
                    value={formik.values.chargedWeight}
                    onChange={formik.handleChange}
                    variant="outlined"
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
            <Grid item md={4} xs={12}>
              <Typography variant="h6">E-Way Bill Details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <TextField
                    fullWidth
                    align="right"
                    inputProps={{ "aria-label": "naked" }}
                    error={Boolean(
                      formik.touched.ewayBillNo && formik.errors.ewayBillNo
                    )}
                    onBlur={formik.handleBlur}
                    helperText={
                      formik.touched.ewayBillNo && formik.errors.ewayBillNo
                    }
                    id="ewayBillNo"
                    name="ewayBillNo"
                    label="Eway Bill No"
                    value={formik.values.ewayBillNo}
                    onChange={formik.handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item md={4} xs={12}>
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
                    renderInput={(params) => (
                      <TextField fullWidth {...params} />
                    )}
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <TextField
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
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
