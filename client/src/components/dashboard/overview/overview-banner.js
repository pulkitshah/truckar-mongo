import PropTypes from "prop-types";
import { Box, Button, Card, Chip, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { ArrowRight as ArrowRightIcon } from "../../../icons/arrow-right";
import router from "next/router";

export const OverviewBanner = (props) => {
  const { t } = useTranslation();
  const { onDismiss, ...other } = props;

  return (
    <Card
      sx={{
        alignItems: "center",
        backgroundColor: "primary.main",
        color: "primary.contrastText",
        display: "flex",
        flexDirection: {
          xs: "column",
          md: "row",
        },
        p: 4,
      }}
      {...other}
    >
      <Box
        sx={{
          mr: 4,
          width: 200,
          height: 200,
          "& img": {
            height: 200,
            width: "auto",
          },
        }}
      >
        <img alt="" src="/static/banner-illustration.png" />
      </Box>
      <div>
        <Typography color="inherit" sx={{ mt: 2 }} variant="h2">
          {t("Welcome to Truckar!")}
        </Typography>
        <Typography color="inherit" sx={{ ml: 2, mt: 2 }} variant="h6">
          {t("Here is where we can start with:")}
        </Typography>
        <Button
          color="inherit"
          startIcon={<ArrowRightIcon fontSize="small" />}
          onClick={() => {
            router.push("dashboard/organisations/new");
          }}
        >
          <Typography
            sx={{ textDecoration: "underline" }}
            display="inline"
            variant="subtitle2"
            fontWeight={700}
          >
            {t("Add your business details")}
          </Typography>
        </Button>
        <Button color="inherit" startIcon={<ArrowRightIcon fontSize="small" />}>
          <Typography
            sx={{ textDecoration: "underline" }}
            display="inline"
            variant="subtitle2"
            fontWeight={700}
          >
            {t("Onboard your trucks")}
          </Typography>
        </Button>
        <Button color="inherit" startIcon={<ArrowRightIcon fontSize="small" />}>
          <Typography
            sx={{ textDecoration: "underline" }}
            display="inline"
            variant="subtitle2"
            fontWeight={700}
          >
            {t("Create a new order")}
          </Typography>
        </Button>
        <Box sx={{ mt: 2 }}>
          <Button color="secondary" onClick={onDismiss} variant="contained">
            {t("Dismiss Banner")}
          </Button>
        </Box>
      </div>
    </Card>
  );
};

OverviewBanner.propTypes = {
  onDismiss: PropTypes.func,
};
