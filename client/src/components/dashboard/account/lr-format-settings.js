import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useFormik, FormikProvider, FieldArray, getIn } from "formik";
import * as Yup from "yup";
import { TextField } from "@mui/material";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";
import { accountApi, userApi } from "../../../api/account-api";
import LrChargeForm from "./lr-charges-form";
import LrFormatAutocomplete from "../autocompletes/lrFormat-autocomplete/lrFormat-autocomplete";

export const LrFormatSettings = (props) => {
  const { account } = useAuth();
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
          chargeName: "",
          chargeDefaultAmount: 0,
          isActive: true,
        },
      ],
      isDefault: lrSetting.isDefault,
    },
    onSubmit: async (values, helpers) => {
      try {
        account.lrSettings.map((lrSetting) => {
          if (lrSetting.lrFormatFileName === values.lrFormatFileName) {
            newLrSettings.push(values);
          } else {
            newLrSettings.push(lrSetting);
          }
        });

        await accountApi.updateAccount(
          {
            id: account.id,
            lrSettings: newLrSettings,
            _version: account._version,
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
      <LrChargeForm formik={formik} />
    </form>
  );
};
