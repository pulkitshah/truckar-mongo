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
import { orderApi } from "../../../api/order-api";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { OnBoardingGuard } from "../../../components/authentication/onboarding-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { OrderDrawer } from "../../../components/dashboard/order/order-drawer";
import OrderGrid from "../../../components/dashboard/order/order-grid";
import { useMounted } from "../../../hooks/use-mounted";
import { useAuth } from "../../../hooks/use-auth";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import { useDispatch, useSelector } from "../../../store";
import DeliveriesGrid from "../../../components/dashboard/order/deliveries-grid";

const tabs = [
  {
    label: "Orders",
    value: "order-register",
  },
  {
    label: "Deliveries",
    value: "delivery-register",
  },
];

const OrderListInner = styled("div", {
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

const OrderList = () => {
  const { t } = useTranslation();

  const [currentTab, setCurrentTab] = useState("order-register");
  const rootRef = useRef(null);
  const [drawer, setDrawer] = useState({
    isOpen: false,
    order: null,
  });
  const [gridApi, setGridApi] = useState(null);

  const handleTabsChange = async (event, value) => {
    setCurrentTab(value);
  };

  const handleOpenDrawer = (params, gridApi) => {
    console.log(params);
    setDrawer({
      isOpen: true,
      order: params,
    });
    setGridApi(gridApi);
  };

  const handleCloseDrawer = () => {
    setDrawer({
      isOpen: false,
      order: null,
    });
    gridApi.forEachNode((node) => node.setSelected(false));
  };

  return (
    <>
      <Head>
        <title>Dashboard: Order List | Truckar</title>
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
        <OrderListInner open={drawer.isOpen}>
          <Box sx={{ px: 3 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{t("Orders")}</Typography>
              </Grid>
              <Grid item>
                <NextLink href="/dashboard/orders/new" passHref>
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
              {tabs.map((tab) => (
                <Tab key={tab.value} label={tab.label} value={tab.value} />
              ))}
            </Tabs>
          </Box>
          <Box sx={{ mt: 3, px: 3, height: "70vh", width: "100%" }}>
            <Divider />
            {currentTab === "order-register" && (
              <OrderGrid onOpenDrawer={handleOpenDrawer} />
            )}
            {currentTab === "delivery-register" && (
              <DeliveriesGrid onOpenDrawer={handleOpenDrawer} />
            )}
          </Box>
        </OrderListInner>
        <OrderDrawer
          containerRef={rootRef}
          onClose={handleCloseDrawer}
          onOpen={handleOpenDrawer}
          open={drawer.isOpen}
          order={drawer.order}
          gridApi={gridApi}
        />
      </Box>
    </>
  );
};

OrderList.getLayout = (page) => (
  <AuthGuard>
    <OnBoardingGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </OnBoardingGuard>
  </AuthGuard>
);

export default OrderList;
