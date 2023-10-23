import { useEffect, useCallback, useRef, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Divider,
  Grid,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { invoiceApi } from "../../../api/invoice-api";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { OnBoardingGuard } from "../../../components/authentication/onboarding-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { InvoiceDrawer } from "../../../components/dashboard/invoice/invoice-drawer";
import InvoiceGrid from "../../../components/dashboard/invoice/invoice-grid";
import { useMounted } from "../../../hooks/use-mounted";
import { useAuth } from "../../../hooks/use-auth";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import { useDispatch, useSelector } from "../../../store";
import { organisationApi } from "../../../api/organisation-api";

const InvoiceListInner = styled("div", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  flexGrow: 1,
  overflow: "hidden",
  paddingBottom: theme.spacing(8),
  paddingTop: theme.spacing(8),
  zIndex: 1,
  [theme.breakpoints.up("lg")]: {
    marginRight: -500,
  },
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    [theme.breakpoints.up("lg")]: {
      marginRight: 0,
    },
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const InvoiceList = () => {
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { account } = useAuth();
  const [tabs, setTabs] = useState([]);
  const [currentTab, setCurrentTab] = useState("all");
  const rootRef = useRef(null);

  const [gridApi, setGridApi] = useState(null);
  const [drawer, setDrawer] = useState({
    isOpen: false,
    invoice: null,
  });

  const getOrganisationsByAccount = useCallback(async () => {
    try {
      let { data } = await organisationApi.getOrganisationsByAccount(
        dispatch,
        account
      );
      let org = data.map((o) => {
        return {
          value: o.id,
          label: o.name,
        };
      });
      setTabs(org);
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    try {
      getOrganisationsByAccount();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleTabsChange = async (event, value) => {
    setCurrentTab(value);
  };

  const handleOpenDrawer = (params, gridApi) => {
    console.log(params);
    setDrawer({
      isOpen: true,
      invoice: params,
    });
    setGridApi(gridApi);
  };

  const handleCloseDrawer = () => {
    setDrawer({
      isOpen: false,
      invoiceId: null,
    });
  };

  return (
    <>
      <Head>
        <title>Dashboard: Invoice List | Truckar</title>
      </Head>
      <Box
        component="main"
        ref={rootRef}
        sx={{
          backgroundColor: "background.paper",
          display: "flex",
          flexGrow: 1,
          overflow: "hidden",
        }}
      >
        <InvoiceListInner open={drawer.isOpen}>
          <Box sx={{ px: 3 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{t("Invoices")}</Typography>
              </Grid>
              <Grid item>
                <NextLink href="/dashboard/invoices/new" passHref>
                  <Button
                    component="a"
                    startIcon={<PlusIcon fontSize="small" />}
                    variant="contained"
                  >
                    Add
                  </Button>
                </NextLink>
              </Grid>
            </Grid>
            <Tabs
              indicatorColor="primary"
              onChange={handleTabsChange}
              scrollButtons="auto"
              textColor="primary"
              value={currentTab}
              sx={{ mt: 3 }}
              variant="scrollable"
            >
              {[{ value: "all", label: "All" }, ...tabs].map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ mt: 3, px: 3, height: "70vh", width: "100%" }}>
            <Divider />
            {currentTab === "all" ? (
              <InvoiceGrid onOpenDrawer={handleOpenDrawer} />
            ) : (
              <InvoicesByOrganisationTable
                onOpenDrawer={handleOpenDrawer}
                organisationId={currentTab}
              />
            )}
          </Box>
        </InvoiceListInner>
        <InvoiceDrawer
          containerRef={rootRef}
          onClose={handleCloseDrawer}
          onOpen={handleOpenDrawer}
          open={drawer.isOpen}
          gridApi={gridApi}
          invoice={drawer.invoice}
        />
      </Box>
    </>
  );
};

InvoiceList.getLayout = (page) => (
  <AuthGuard>
    <OnBoardingGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </OnBoardingGuard>
  </AuthGuard>
);

export default InvoiceList;
