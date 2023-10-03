import { useState } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { DashboardNavbar } from "./dashboard-navbar";
import { DashboardSidebar } from "./dashboard-sidebar";
import { Box } from "@mui/material";

const DashboardLayoutRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  paddingTop: 64,
  [theme.breakpoints.up("lg")]: {
    paddingLeft: 60,
  },
}));

export const DashboardLayout = (props) => {
  const { children } = props;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <DashboardNavbar
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          open={isSidebarOpen}
        />
        <DashboardSidebar
          onClose={() => setIsSidebarOpen(false)}
          open={isSidebarOpen}
        />
        <DashboardLayoutRoot>
          <Box
            sx={{
              display: "flex",
              // flex: '1 1 auto',
              flexDirection: "column",
              // width: ' 100%',
              flexGrow: 1,
              p: 3,
            }}
          >
            {children}
          </Box>
        </DashboardLayoutRoot>
      </Box>
    </>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node,
};
