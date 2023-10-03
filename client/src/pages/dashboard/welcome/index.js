import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Box, Container, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import Stepper from "../../../components/dashboard/welcome/stepper";
import { gtm } from "../../../lib/gtm";
import { useAuth } from "../../../hooks/use-auth";

const Overview = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (user.onBoardingRequired === false) {
      router.push({
        pathname: "/dashboard/orders",
      });
    }
    gtm.push({ event: "page_view" });
  }, []);

  if (user.onBoardingRequired === false) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard: Overview | Truckar</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{`${t("Welcome")} ${
                  user.name
                },`}</Typography>
                <Typography sx={{ mt: 2 }} variant="h6">
                  {t(
                    "We are so happy to have you with us. Let us help you figure things out."
                  )}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item xs={8}>
                <Stepper />
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

Overview.getLayout = (page) => (
  <AuthGuard>
    <DashboardLayout>{page}</DashboardLayout>
  </AuthGuard>
);

export default Overview;
