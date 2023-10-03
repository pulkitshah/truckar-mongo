import { useState, useEffect } from "react";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { Box, Container, Divider, Tab, Tabs, Typography } from "@mui/material";
import { AuthGuard } from "../../components/authentication/auth-guard";
import { OnBoardingGuard } from "../../components/authentication/onboarding-guard";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { AccountBillingSettings } from "../../components/dashboard/account/account-billing-settings";
import { AccountGeneralSettings } from "../../components/dashboard/account/account-general-settings";
import { AccountNotificationsSettings } from "../../components/dashboard/account/account-notifications-settings";
import { AccountOrderLRInvoiceSettings } from "../../components/dashboard/account/account-order-lr-invoice-settings";
import { AccountTeamSettings } from "../../components/dashboard/account/account-team-settings";
import { AccountSecuritySettings } from "../../components/dashboard/account/account-security-settings";
import { gtm } from "../../lib/gtm";

const tabs = [
  { label: "General", value: "general" },
  { label: "Order, LR and Invoice", value: "order-lr-invoice" },
  { label: "Billing", value: "billing" },
  { label: "Team", value: "team" },
  { label: "Notifications", value: "notifications" },
  { label: "Security", value: "security" },
];

const Account = () => {
  const [currentTab, setCurrentTab] = useState("general");
  const { i18n, t } = useTranslation();

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const handleTabsChange = (event, value) => {
    setCurrentTab(value);
  };

  return (
    <>
      <Head>
        <title>Dashboard: Account | Truckar</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4">{t("Settings")}</Typography>
          <Tabs
            indicatorColor="primary"
            onChange={handleTabsChange}
            scrollButtons="auto"
            textColor="primary"
            value={currentTab}
            variant="scrollable"
            sx={{ mt: 3 }}
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
          <Divider sx={{ mb: 3 }} />
          {currentTab === "general" && <AccountGeneralSettings />}
          {currentTab === "order-lr-invoice" && (
            <AccountOrderLRInvoiceSettings />
          )}
          {currentTab === "billing" && <AccountBillingSettings />}
          {currentTab === "team" && <AccountTeamSettings />}
          {currentTab === "notifications" && <AccountNotificationsSettings />}
          {currentTab === "security" && <AccountSecuritySettings />}
        </Container>
      </Box>
    </>
  );
};

Account.getLayout = (page) => (
  <AuthGuard>
    {/* <OnBoardingGuard> */}
    <DashboardLayout>{page}</DashboardLayout>
    {/* </OnBoardingGuard> */}
  </AuthGuard>
);

export default Account;
