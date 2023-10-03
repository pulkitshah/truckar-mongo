import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useFormik, FormikProvider, FieldArray, getIn } from "formik";
import * as Yup from "yup";
import { TextField } from "@mui/material";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import { userApi } from "../../../api/user-api";
import LrChargeForm from "./lr-charges-form";
import LrFormatAutocomplete from "../autocompletes/lrFormat-autocomplete/lrFormat-autocomplete";
import { accountApi } from "../../../api/account-api";

export const LrFormatSettings = (props) => {
  const { user, initialize } = useAuth();
  const { lrSetting } = props;
  const dispatch = useDispatch();
  let newLrSettings = [];

  const formik = useFormik({
    initialValues: {
      lrFormatFileName: lrSetting.lrFormatFileName || "standard-local",
      lrCharges: lrSetting.lrCharges || [
        {
          id: uuidv4(),
          chargeSrNo: 1,
          chargeName: "Hamali",
          chargeDefaultAmount: 0,
          isActive: true,
        },
        {
          id: uuidv4(),
          chargeSrNo: 2,
          chargeName: "Door Collection Charges",
          chargeDefaultAmount: 0,
          isActive: true,
        },
        {
          id: uuidv4(),
          chargeSrNo: 3,
          chargeName: "Door Delivery Charges",
          chargeDefaultAmount: 0,
          isActive: true,
        },
        {
          id: uuidv4(),
          chargeSrNo: 4,
          chargeName: "Statistical Charges",
          chargeDefaultAmount: 0,
          isActive: true,
        },
        {
          id: uuidv4(),
          chargeSrNo: 5,
          chargeName: "Misc Charges",
          chargeDefaultAmount: 0,
          isActive: true,
        },
        {
          id: uuidv4(),
          chargeSrNo: 6,
          chargeName: "I.C Charge",
          chargeDefaultAmount: 0,
          isActive: true,
        },
      ],
      isDefault: lrSetting.isDefault,
    },
    onSubmit: async (values, helpers) => {
      try {
        props.accountRef.current.lrSettings.map((lrSetting) => {
          if (lrSetting.lrFormatFileName === values.lrFormatFileName) {
            newLrSettings.push(values);
          } else {
            newLrSettings.push(lrSetting);
          }
        });

        await accountApi.updateAccount(
          {
            id: props.accountRef.current.id,
            lrSettings: newLrSettings,
          },
          dispatch
        );
        toast.success("LR Format Settings updated!");
        // router.push("/dashboard/orders");
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
    <form onSubmit={formik.handleSubmit} {...props}>
      <LrFormatAutocomplete formik={formik} />
      <LrChargeForm formik={formik} handleNext={props.handleNext} />
    </form>
  );
};
