import { useEffect, useCallback, useRef, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "../../../store";
import { driverApi } from "../../../api/driver-api";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { OnBoardingGuard } from "../../../components/authentication/onboarding-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { DriverDrawer } from "../../../components/dashboard/driver/driver-drawer";
import DriverGrid from "../../../components/dashboard/driver/driver-grid";
import { useAuth } from "../../../hooks/use-auth";
import { Plus as PlusIcon } from "../../../icons/plus";
import { useMounted } from "../../../hooks/use-mounted";

const DriverListInner = styled("div", {
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

const DriverList = () => {
  const { t } = useTranslation();
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const { account } = useAuth();
  const rootRef = useRef(null);
  const { drivers } = useSelector((state) => state.drivers);

  const [drawer, setDrawer] = useState({
    isOpen: false,
    driverId: null,
  });

  const handleOpenDrawer = (params) => {
    setDrawer({
      isOpen: true,
      driverId: params.row._id,
    });
  };

  const getDriversByAccount = useCallback(async () => {
    try {
      await driverApi.getDriversByAccount({ dispatch, account: account._id });
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    try {
      getDriversByAccount();
    } catch (error) {
      console.log(error);
    }
  }, []);
  const handleCloseDrawer = () => {
    setDrawer({
      isOpen: false,
      driverId: null,
    });
  };

  return (
    <>
      <Head>
        <title>Dashboard: Driver List | Truckar</title>
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
        <DriverListInner open={drawer.isOpen}>
          <Box sx={{ px: 3 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{t("Drivers")}</Typography>
              </Grid>
              <Grid item>
                <NextLink href="/dashboard/drivers/new" passHref>
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
          </Box>
          <Box sx={{ mt: 3, px: 3, height: "70vh", width: "100%" }}>
            <Divider />
            <DriverGrid onOpenDrawer={handleOpenDrawer} drivers={drivers} />
          </Box>
        </DriverListInner>
        <DriverDrawer
          containerRef={rootRef}
          onClose={handleCloseDrawer}
          open={drawer.isOpen}
          driver={drivers.find((driver) => driver._id === drawer.driverId)}
        />
      </Box>
    </>
  );
};

DriverList.getLayout = (page) => (
  <AuthGuard>
    <OnBoardingGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </OnBoardingGuard>
  </AuthGuard>
);

export default DriverList;
