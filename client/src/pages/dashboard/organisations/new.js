import { useEffect } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { Box, Breadcrumbs, Container, Link, Typography } from "@mui/material";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { OrganisationCreateForm } from "../../../components/dashboard/organisation/organisation-create-form";
import { gtm } from "../../../lib/gtm";
import { OnBoardingGuard } from "../../../components/authentication/onboarding-guard";

const OrganisationCreate = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard: Organisation Create | Truckar</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4">Create a new organisation</Typography>
            <Breadcrumbs separator="/" sx={{ mt: 1 }}>
              <NextLink href="/dashboard" passHref>
                <Link variant="subtitle2">Dashboard</Link>
              </NextLink>
              <NextLink href="/dashboard" passHref>
                <Link color="primary" variant="subtitle2">
                  Management
                </Link>
              </NextLink>
              <Typography color="textSecondary" variant="subtitle2">
                Organisations
              </Typography>
            </Breadcrumbs>
          </Box>
          <OrganisationCreateForm />
        </Container>
      </Box>
    </>
  );
};

OrganisationCreate.getLayout = (page) => (
  <AuthGuard>
    <OnBoardingGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </OnBoardingGuard>
  </AuthGuard>
);

export default OrganisationCreate;
