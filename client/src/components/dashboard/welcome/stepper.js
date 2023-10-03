import * as React from "react";
import { useRef } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Step,
  Stepper,
  StepLabel,
  Typography,
} from "@mui/material";
import { Briefcase as BriefcaseIcon } from "../../../icons/briefcase";
import { useTranslation } from "react-i18next";
import { AccountCreateForm } from "./account-create-form";
import { OrderExpensesSettings } from "./order-expenses-settings";
import { LrSettings } from "./lr-settings";
import { FormatSettings } from "./format-settings";
import { TaxSettings } from "./tax-settings";

const steps = [
  "Create Account",
  "Order Expenses",
  "LR Settings",
  "Default formats for LR and Invoice",
  "Tax Settings",
];

export default function HorizontalNonLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const accountRef = useRef(null);

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const router = useRouter();
  const { t } = useTranslation();

  const accountCreate = (
    <React.Fragment>
      <Grid item xs={12} sx={{ py: 2 }}>
        <Typography variant="h5" sx={{ mt: 2 }}>
          {t("Let us create your account")}
        </Typography>

        <AccountCreateForm handleNext={handleNext} accountRef={accountRef} />
      </Grid>
    </React.Fragment>
  );

  const orderExpenses = (
    <React.Fragment>
      <Grid item xs={12} sx={{ py: 2 }}>
        <Typography variant="h5" sx={{ mt: 2 }}>
          {t("Please enter your regular order expenses categories.")}
        </Typography>

        <OrderExpensesSettings
          handleNext={handleNext}
          accountRef={accountRef}
        />
      </Grid>
    </React.Fragment>
  );

  const lrSettings = (
    <React.Fragment>
      <Grid item xs={12} sx={{ py: 2 }}>
        <Typography variant="h5" sx={{ mt: 2 }}>
          {t("Expense categories for your LR.")}
        </Typography>
        <Typography variant="body2">
          {t("(These expenses will be displayed in your LR)")}
        </Typography>
        <LrSettings handleNext={handleNext} accountRef={accountRef} />
      </Grid>
    </React.Fragment>
  );

  const formatSettings = (
    <React.Fragment>
      <Grid item xs={12} sx={{ py: 2 }}>
        <Typography variant="h5" sx={{ mt: 2 }}>
          {t("Default format for your LR and Invoice.")}
        </Typography>
        <Typography variant="body2">
          {t("(These will be the default formats for your LR and Invoice)")}
        </Typography>
        <FormatSettings handleNext={handleNext} accountRef={accountRef} />
      </Grid>
    </React.Fragment>
  );

  const taxSettings = (
    <React.Fragment>
      <Grid item xs={12} sx={{ py: 2 }}>
        <Typography variant="h5" sx={{ mt: 2 }}>
          {t("Taxes available for Invoicing.")}
        </Typography>
        <Typography variant="body2">
          {t("(These will be the taxes that you can add while making invoice)")}
        </Typography>
        <TaxSettings handleNext={handleNext} accountRef={accountRef} />
      </Grid>
    </React.Fragment>
  );

  return (
    <Box sx={{ minWidth: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label, index) => {
          const stepProps = {};
          const labelProps = {};

          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === 0 && accountCreate}
      {activeStep === 1 && orderExpenses}
      {activeStep === 2 && lrSettings}
      {activeStep === 3 && formatSettings}
      {activeStep === 4 && taxSettings}
    </Box>
  );
}
