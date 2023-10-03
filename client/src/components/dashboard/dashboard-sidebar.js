import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Box, Divider, useMediaQuery } from "@mui/material";
import { styled } from "@mui/material/styles";

import MuiDrawer from "@mui/material/Drawer";

import { Calendar as CalendarIcon } from "../../icons/calendar";
import { Cash as CashIcon } from "../../icons/cash";
import { ChartBar as ChartBarIcon } from "../../icons/chart-bar";
import { ChartPie as ChartPieIcon } from "../../icons/chart-pie";
import { ChatAlt2 as ChatAlt2Icon } from "../../icons/chat-alt2";
import { ClipboardList as ClipboardListIcon } from "../../icons/clipboard-list";
import { CreditCard as CreditCardIcon } from "../../icons/credit-card";
import { Home as HomeIcon } from "../../icons/home";
import { LockClosed as LockClosedIcon } from "../../icons/lock-closed";
import { Mail as MailIcon } from "../../icons/mail";
import { MailOpen as MailOpenIcon } from "../../icons/mail-open";
import { Newspaper as NewspaperIcon } from "../../icons/newspaper";
import { OfficeBuilding as OfficeBuildingIcon } from "../../icons/office-building";
import { ReceiptTax as ReceiptTaxIcon } from "../../icons/receipt-tax";
import { Photograph as PhotographIcon } from "../../icons/photograph";
import { ShoppingBag as ShoppingBagIcon } from "../../icons/shopping-bag";
import { ShoppingCart as ShoppingCartIcon } from "../../icons/shopping-cart";
import { Truck as TruckIcon } from "../../icons/truck";
import { UserCircle as UserCircleIcon } from "../../icons/user-circle";
import { Users as UsersIcon } from "../../icons/users";
import { XCircle as XCircleIcon } from "../../icons/x-circle";
import { Scrollbar } from "../scrollbar";
import { DashboardSidebarSection } from "./dashboard-sidebar-section";
import { OrganizationPopover } from "./organization-popover";

const getSections = (t) => [
  {
    title: t("General"),
    items: [
      // {
      //   title: t("Overview"),
      //   path: "/dashboard",
      //   icon: <HomeIcon fontSize="small" />,
      // },
      {
        title: t("Orders"),
        path: "/dashboard/orders",
        icon: <TruckIcon fontSize="small" />,
      },
      {
        title: t("Lorry Receipt"),
        path: "/dashboard/lrs",
        icon: <NewspaperIcon fontSize="small" />,
      },
      {
        title: t("Invoice"),
        path: "/dashboard/invoices",
        icon: <ReceiptTaxIcon fontSize="small" />,
      },
      {
        title: t("Parties"),
        path: "/dashboard/parties",
        icon: <UsersIcon fontSize="small" />,
      },
    ],
  },
  {
    title: t("Platforms"),
    items: [
      {
        title: t("Organisations"),
        path: "/dashboard/organisations",
        icon: <OfficeBuildingIcon fontSize="small" />,
      },
      {
        title: t("Vehicles"),
        path: "/dashboard/vehicles",
        icon: <TruckIcon fontSize="small" />,
      },
      {
        title: t("Drivers"),
        path: "/dashboard/drivers",
        icon: <UserCircleIcon fontSize="small" />,
      },
      {
        title: t("Branches"),
        path: "/dashboard/branches",
        icon: <HomeIcon fontSize="small" />,
      },
      // {
      //   title: t("Blog"),
      //   path: "/blog",
      //   icon: <NewspaperIcon fontSize="small" />,
      //   children: [
      //     {
      //       title: t("Post List"),
      //       path: "/blog",
      //     },
      //     {
      //       title: t("Post Details"),
      //       path: "/blog/1",
      //     },
      //     {
      //       title: t("Post Create"),
      //       path: "/blog/new",
      //     },
      //   ],
      // },
    ],
  },
];

export const DashboardSidebar = (props) => {
  const { onClose, open } = props;
  const router = useRouter();
  const { t } = useTranslation();

  const sections = useMemo(() => getSections(t), [t]);
  const organizationsRef = useRef(null);
  const [openOrganizationsPopover, setOpenOrganizationsPopover] =
    useState(false);

  const handlePathChange = () => {
    if (!router.isReady) {
      return;
    }

    if (open) {
      onClose?.();
    }
  };

  useEffect(
    handlePathChange,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.isReady, router.asPath]
  );

  const handleOpenOrganizationsPopover = () => {
    setOpenOrganizationsPopover(true);
  };

  const handleCloseOrganizationsPopover = () => {
    setOpenOrganizationsPopover(false);
  };

  const DrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  }));

  const content = (
    <>
      <Scrollbar
        sx={{
          height: "100%",
          "& .simplebar-content": {
            height: "100%",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <DrawerHeader>
            <XCircleIcon onClick={onClose} />
          </DrawerHeader>

          <Box sx={{ flexGrow: 1 }}>
            {sections.map((section) => (
              <DashboardSidebarSection
                onClose={onClose}
                key={section.title}
                path={router.asPath}
                sx={{
                  mt: 2,
                  "& + &": {
                    mt: 2,
                  },
                }}
                {...section}
              />
            ))}
          </Box>
          <Divider
            sx={{
              borderColor: "#2D3748", // dark divider
            }}
          />
        </Box>
      </Scrollbar>
      {/* <OrganizationPopover
        anchorEl={organizationsRef.current}
        onClose={handleCloseOrganizationsPopover}
        open={openOrganizationsPopover}
      /> */}
    </>
  );
  const openedMixin = (theme) => ({
    width: 280,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  });

  const closedMixin = (theme) => ({
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    [theme.breakpoints.up("sm")]: {
      width: `calc(${theme.spacing(6)} + 1px)`,
    },
  });

  const Drawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
  })(({ theme, open }) => ({
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  }));

  return (
    <>
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            backgroundColor: "neutral.900",
            color: "#FFFFFF",
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    </>
  );
};

DashboardSidebar.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
