import { useEffect, useCallback, useRef, useState } from "react";
import NextLink from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "../../../store";
import { branchApi } from "../../../api/branch-api";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { OnBoardingGuard } from "../../../components/authentication/onboarding-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { BranchDrawer } from "../../../components/dashboard/branch/branch-drawer";
import BranchGrid from "../../../components/dashboard/branch/branch-grid";
import { useAuth } from "../../../hooks/use-auth";
import { Plus as PlusIcon } from "../../../icons/plus";
import { useMounted } from "../../../hooks/use-mounted";

const BranchListInner = styled("div", {
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

const BranchList = () => {
  const { t } = useTranslation();
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const rootRef = useRef(null);
  const { branches } = useSelector((state) => state.branches);

  const [drawer, setDrawer] = useState({
    isOpen: false,
    branchId: null,
  });

  const handleOpenDrawer = (params) => {
    setDrawer({
      isOpen: true,
      branchId: params.row.id,
    });
  };

  const getBranchesByUser = useCallback(async () => {
    try {
      await branchApi.getBranchesByUser(user, dispatch);
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    try {
      getBranchesByUser();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleCloseDrawer = () => {
    setDrawer({
      isOpen: false,
      branchId: null,
    });
  };

  return (
    <>
      <Head>
        <title>Dashboard: Branch List | Truckar</title>
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
        <BranchListInner open={drawer.isOpen}>
          <Box sx={{ px: 3 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{t("Branches")}</Typography>
              </Grid>
              <Grid item>
                <NextLink href="/dashboard/branches/new" passHref>
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
            <BranchGrid onOpenDrawer={handleOpenDrawer} branches={branches} />
          </Box>
        </BranchListInner>
        <BranchDrawer
          containerRef={rootRef}
          onClose={handleCloseDrawer}
          open={drawer.isOpen}
          branch={branches.find((branch) => branch.id === drawer.branchId)}
        />
      </Box>
    </>
  );
};

BranchList.getLayout = (page) => (
  <AuthGuard>
    <OnBoardingGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </OnBoardingGuard>
  </AuthGuard>
);

export default BranchList;
