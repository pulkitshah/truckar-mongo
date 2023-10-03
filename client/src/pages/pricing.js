import { useEffect } from "react";
import Head from "next/head";
import {
  Badge,
  Box,
  Container,
  Divider,
  Grid,
  Switch,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MainLayout } from "../components/main-layout";
import { PricingPlan } from "../components/pricing/pricing-plan";
import { gtm } from "../lib/gtm";

const Pricing = () => {
  const theme = useTheme();

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Pricing | Material Kit Pro</title>
      </Head>
      <Box
        component="main"
        sx={{
          backgroundColor: "background.paper",
          flexGrow: 1,
          pb: 6,
        }}
      >
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            <Grid item md={4} xs={12}>
              <PricingPlan
                cta="Sign up"
                currency="Rs"
                description="Billing Monthly"
                features={[
                  "Create Multiple Companies",
                  "Vehicle and Driver Management ",
                  "Customer Management ",
                  "Create Orders",
                  "Create LRs",
                  "Create Sale Invoices",
                  "Whatsapp Communication",
                ]}
                image="/static/pricing/plan1.svg"
                name="Startup"
                popular
                price="10"
                sx={{
                  height: "100%",
                  maxWidth: 460,
                  mx: "auto",
                }}
              />
            </Grid>
            <Grid item md={4} xs={12}>
              <PricingPlan
                cta="Contact Us"
                currency="Rs"
                description="Billing Monthly"
                features={[
                  "All previous",
                  "Dashboard Access",
                  "Purchase Invoices",
                  "Route Analysis",
                  "Export data to Excel",
                  "Multi users",
                ]}
                image="/static/pricing/plan2.svg"
                name="Standard"
                price="15"
                sx={{
                  height: "100%",
                  maxWidth: 460,
                  mx: "auto",
                }}
              />
            </Grid>
            <Grid item md={4} xs={12}>
              <PricingPlan
                cta="Contact Us"
                currency="Rs"
                description="Billing Monthly"
                features={[
                  "All previous",
                  "Analytics platform",
                  "Offline Access",
                  "Local Database",
                  "Role and Permissions",
                ]}
                image="/static/pricing/plan3.svg"
                name="Business"
                price="25"
                sx={{
                  height: "100%",
                  maxWidth: 460,
                  mx: "auto",
                }}
              />
            </Grid>
          </Grid>
        </Container>
        <Typography
          align="center"
          color="textSecondary"
          component="p"
          variant="caption"
        >
          30% of our income goes into Whale Charity
        </Typography>
      </Box>
    </>
  );
};

Pricing.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Pricing;
