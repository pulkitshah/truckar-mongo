import NextLink from "next/link";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const HomeDevelopers = (props) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        py: 15,
      }}
      {...props}
    >
      <Container maxWidth="lg">
        <Grid alignItems="center" container justifyContent="center" spacing={3}>
          <Grid
            item
            md={6}
            xs={12}
            sx={{
              order: {
                xs: 2,
                md: 1,
              },
            }}
          >
            <div>
              <Typography variant="h3">
                Digitizing Transport Management
              </Typography>
              <Typography
                color="textSecondary"
                sx={{ my: 3 }}
                variant="subtitle1"
              >
                The Truckar interface provides a consolidated platform to manage
                Truck Fleets. As a comprehensive Trucking TMS, it handles every
                aspect of the transportation cycle such as creating digital LR &
                invoices, automated sales amount calculation, tracking vehicle
                performance & managing drivers. The software experience is
                customised for each partner & we provide a seamless onboarding
                experience. Explore features of our Trucking TMS & contact us
                for any additional information you need.
              </Typography>
            </div>
          </Grid>
          <Grid
            item
            md={6}
            sm={8}
            xs={12}
            sx={{
              order: {
                xs: 1,
                md: 2,
              },
            }}
          >
            <Box
              sx={{
                position: "relative",
                pt: "calc(960 / 1225 * 100%)",
                "& img": {
                  height: "auto",
                  position: "absolute",
                  top: 0,
                  width: "100%",
                },
              }}
            >
              <img
                alt="For transporters"
                src={`/static/home/developers_${theme.palette.mode}.png`}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
