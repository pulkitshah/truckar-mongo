import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import NextLink from "next/link";
import Head from "next/head";
import { format } from "date-fns";
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
import { orderApi } from "../../../api/order-api";
import { useAuth } from "../../../hooks/use-auth";
import { AuthGuard } from "../../../components/authentication/auth-guard";
import { OnBoardingGuard } from "../../../components/authentication/onboarding-guard";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import DeliveryGrid from "../../../components/dashboard/order/delivery-details-grid";
import { OrderLogs } from "../../../components/dashboard/order/order-logs";
import { OrderSummary } from "../../../components/dashboard/order/order-summary";
import { useMounted } from "../../../hooks/use-mounted";
import { Calendar as CalendarIcon } from "../../../icons/calendar";
import { ChevronDown as ChevronDownIcon } from "../../../icons/chevron-down";
import { PencilAlt as PencilAltIcon } from "../../../icons/pencil-alt";
import { useDispatch, useSelector } from "../../../store";
import { gtm } from "../../../lib/gtm";

const OrderDetails = () => {
  const router = useRouter();
  const { user } = useAuth();
  const isMounted = useMounted();
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const getOrder = useCallback(async () => {
    try {
      let data = await orderApi.getOrdersByUser(user, dispatch);
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(
    () => {
      getOrder();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { orderId } = router.query;

  const order = orders.find((order) => order.id === orderId);

  if (!order) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Dashboard: Order Details | Truckar</title>
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
            <NextLink href="/dashboard/orders" passHref>
              <Link
                color="textPrimary"
                component="a"
                sx={{
                  alignItems: "center",
                  display: "flex",
                }}
              >
                <ArrowBackIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="subtitle2">Orders</Typography>
              </Link>
            </NextLink>
          </Box>
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{order.number}</Typography>
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
                    {/* {format(order.createdAt, "dd/MM/yyyy HH:mm")} */}
                  </Typography>
                </Box>
              </Grid>
              <Grid item sx={{ ml: -2 }}>
                <Button
                  endIcon={<PencilAltIcon fontSize="small" />}
                  variant="outlined"
                  sx={{ ml: 2 }}
                >
                  Edit
                </Button>
                <Button
                  endIcon={<ChevronDownIcon fontSize="small" />}
                  variant="contained"
                  sx={{ ml: 2 }}
                >
                  Action
                </Button>
              </Grid>
            </Grid>
          </Box>
          <OrderSummary order={order} />
          <Box sx={{ mt: 4 }}>
            <Card>
              <CardHeader sx={{ mt: 2 }} title="Deliveries" />
              <Divider />
              <Box sx={{ ml: 2 }}>
                <DeliveryGrid order={order} deliveries={order.deliveries} />
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>
    </>
  );
};

OrderDetails.getLayout = (page) => (
  <AuthGuard>
    <OnBoardingGuard>
      <DashboardLayout>{page}</DashboardLayout>
    </OnBoardingGuard>
  </AuthGuard>
);

export default OrderDetails;
