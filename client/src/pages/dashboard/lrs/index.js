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
import { lrApi } from "../../../api/lr-api";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { OnBoardingGuard } from "../../../components/authentication/onboarding-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { LrDrawer } from "../../../components/dashboard/lr/lr-drawer";
import LrGrid from "../../../components/dashboard/lr/lr-grid";
import { useMounted } from "../../../hooks/use-mounted";
import { useAuth } from "../../../hooks/use-auth";
import { Plus as PlusIcon } from "../../../icons/plus";
import { Search as SearchIcon } from "../../../icons/search";
import { gtm } from "../../../lib/gtm";
import { useDispatch, useSelector } from "../../../store";
import { partyApi } from "../../../api/party-api";
import { organisationApi } from "../../../api/organisation-api";
import LrsByOrganisationTable from "../../../components/dashboard/lr/lr-organisatoin-grid";

const LrListInner = styled("div", {
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

const LrList = () => {
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { account } = useAuth();
  const [tabs, setTabs] = useState([]);
  const [currentTab, setCurrentTab] = useState("all");
  const rootRef = useRef(null);

  const [drawer, setDrawer] = useState({
    isOpen: false,
    lr: null,
  });
  const [gridApi, setGridApi] = useState(null);

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
    setDrawer({
      isOpen: true,
      lr: params,
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
        <title>Dashboard: Lr List | Truckar</title>
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
        <LrListInner open={drawer.isOpen}>
          <Box sx={{ px: 3 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{t("Lrs")}</Typography>
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
              <LrGrid onOpenDrawer={handleOpenDrawer} />
            ) : (
              <LrsByOrganisationTable
                onOpenDrawer={handleOpenDrawer}
                organisationId={currentTab}
              />
            )}
          </Box>
        </LrListInner>
        <LrDrawer
          containerRef={rootRef}
          onClose={handleCloseDrawer}
          onOpen={handleOpenDrawer}
          open={drawer.isOpen}
          lr={drawer.lr}
          gridApi={gridApi}
        />
      </Box>
    </>
  );
};

LrList.getLayout = (page) => (
  <AuthGuard>
    <OnBoardingGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </OnBoardingGuard>
  </AuthGuard>
);

export default LrList;
