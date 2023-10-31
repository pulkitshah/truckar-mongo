import React, { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { useFormik, FormikProvider, FieldArray, getIn } from "formik";
import * as Yup from "yup";
import { useAuth } from "../../../hooks/use-auth";
import { useDispatch } from "../../../store";

import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { userApi } from "../../../api/account-api";
import { LrFormatSettings } from "./lr-format-settings";

export const LrSettings = (props) => {
  const { account } = useAuth();
  const { t } = useTranslation();

  return (
    <Box sx={{ mt: 4 }} {...props}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">
                {t("LR Expenses Categories")}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {t("Expenses to store and charge the customer in LR ")}
              </Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              {account.lrSettings.map((lrSetting, index) => {
                return (
                  <>
                    {index > 0 && <Divider sx={{ my: 4 }} />}
                    <LrFormatSettings lrSetting={lrSetting} />
                  </>
                );
              })}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
