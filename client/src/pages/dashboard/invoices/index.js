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
import { partyApi } from "../../../api/party-api";

const tabs = [
  {
    label: "INVOICE REGISTER",
    value: "invoice-register",
  },
  {
    label: "Canceled",
    value: "canceled",
  },
];

const sortOptions = [
  {
    label: "Newest",
    value: "desc",
  },
  {
    label: "Oldest",
    value: "asc",
  },
];

const applyFilters = (invoices, filters) =>
  invoices.filter((invoice) => {
    if (filters.query) {
      // Checks only the invoice number, but can be extended to support other fields, such as customer
      // name, email, etc.
      const containsQuery = invoice.number
        .toLowerCase()
        .includes(filters.query.toLowerCase());

      if (!containsQuery) {
        return false;
      }
    }

    if (typeof filters.status !== "undefined") {
      const statusMatched = invoice.status === filters.status;

      if (!statusMatched) {
        return false;
      }
    }

    return true;
  });

const applySort = (invoices, invoice) =>
  invoices.sort((a, b) => {
    const comparator = a.createdAt > b.createdAt ? -1 : 1;

    return invoice === "desc" ? comparator : -comparator;
  });

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
  const { invoices } = useSelector((state) => state.invoices);

  // const [invoices, setInvoices] = useState([]);
  const { t } = useTranslation();

  const { user } = useAuth();
  const rootRef = useRef(null);
  const queryRef = useRef(null);
  const [sort, setSort] = useState("desc");

  const [filters, setFilters] = useState({
    query: "",
    status: undefined,
  });
  const [drawer, setDrawer] = useState({
    isOpen: false,
    invoiceId: null,
  });

  const getInvoicesByUser = useCallback(async () => {
    try {
      let data = await invoiceApi.getInvoicesByUser(user, dispatch);
      if (isMounted()) {
        // setInvoices(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [isMounted]);

  useEffect(() => {
    try {
      getInvoicesByUser();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const newInvoice = useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  const handleQueryChange = (event) => {
    event.preventDefault();
    setFilters((prevState) => ({
      ...prevState,
      query: queryRef.current?.value,
    }));
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    setSort(value);
  };

  const handleOpenDrawer = (params) => {
    setDrawer({
      isOpen: true,
      invoiceId: params.row.id,
    });
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
          </Box>
          <Box sx={{ mt: 3, px: 3, height: "70vh", width: "100%" }}>
            <Divider />
            <InvoiceGrid onOpenDrawer={handleOpenDrawer} invoices={invoices} />
          </Box>
        </InvoiceListInner>
        <InvoiceDrawer
          containerRef={rootRef}
          onClose={handleCloseDrawer}
          open={drawer.isOpen}
          invoice={invoices.find((invoice) => invoice.id === drawer.invoiceId)}
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
