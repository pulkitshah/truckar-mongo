import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import Head from "next/head";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { Storage } from "aws-amplify";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Container,
  Divider,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { lrApi } from "../../../api/lr-api";
import { useAuth } from "../../../hooks/use-auth";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { OnBoardingGuard } from "../../../components/authentication/onboarding-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { LrSummary } from "../../../components/dashboard/lr/lr-summary";
import { useMounted } from "../../../hooks/use-mounted";
import { Calendar as CalendarIcon } from "../../../icons/calendar";
import { PencilAlt as PencilAltIcon } from "../../../icons/pencil-alt";
import { useDispatch, useSelector } from "../../../store";
import { gtm } from "../../../lib/gtm";
import { LrForm } from "../../../components/dashboard/lr/lr-drawer";
import LrPDFs from "../../../components/dashboard/lr/LrPDFs";
import moment from "moment";

const LrDetails = () => {
  const router = useRouter();
  const { user } = useAuth();
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const { lrs } = useSelector((state) => state.lrs);
  const [logo, setLogo] = useState();
  const [lr, setLr] = useState();
  const { lrId } = router.query;

  const LrFormat = LrPDFs["Format1"];

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getLr = useCallback(async () => {
    try {
      let data = await lrApi.getLrsByUser(user, dispatch);
      setLr(data.find((lr) => lr.id === lrId));
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      getLr();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  let newLr = { ...lr };

  if (lr) {
    newLr.delivery = JSON.parse(lr.order.deliveries).find((del) => {
      return del.id.toString() === lr.deliveryId.toString();
    });
  }

  const getOrganisationLogo = useCallback(async () => {
    try {
      if (lr) {
        const logo = await Storage.get(lr.organisation.logo);
        setLogo(logo);
      }
    } catch (err) {
      console.error(err);
    }
  }, [lr]);

  useEffect(() => {
    try {
      getOrganisationLogo();
    } catch (error) {
      console.log(error);
    }
  }, [lr]);

  if (!lr) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard: Lr Details | Truckar</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 4 }}>
            <NextLink href="/dashboard/lrs" passHref>
              <Link
                color="textPrimary"
                component="a"
                sx={{
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Lrs</Typography>
              </Link>
            </NextLink>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{lr.number}</Typography>
                <Box
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    ml: -1,
                    mt: 1,
                  }}
                >
                  <Typography
                    color="textSecondary"
                    variant="body2"
                    sx={{ ml: 1 }}
                  >
                    Placed on
                  </Typography>
                  <CalendarIcon
                    color="action"
                    fontSize="small"
                    sx={{ ml: 1 }}
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {moment(lr.lrDate).format("DD/MM/YYYY")}
                  </Typography>
                </Box>
              </Grid>
              <Grid item sx={{ ml: -2 }}>
                <Button
                  endIcon={<PencilAltIcon fontSize="small" />}
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={handleEdit}
                >
                  Edit
                </Button>
                {logo && (
                  <PDFDownloadLink
                    document={
                      <LrFormat logo={logo} lr={newLr} printRates={false} />
                    }
                    fileName={`Lr - ${lr.id}`}
                    style={{
                      textDecoration: "none",
                    }}
                  >
                    <Button variant="outlined" sx={{ ml: 2 }}>
                      Preview
                    </Button>
                  </PDFDownloadLink>
                )}
              </Grid>
            </Grid>
          </Box>
          {!isEditing ? (
            <LrSummary lr={lr} getLr={getLr} />
          ) : (
            <LrForm onCancel={handleCancel} getLr={getLr} lr={lr} />
          )}
        </Container>
      </Box>
    </>
  );
};

LrDetails.getLayout = (page) => (
  <AuthGuard>
    <OnBoardingGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </OnBoardingGuard>
  </AuthGuard>
);

export default LrDetails;
