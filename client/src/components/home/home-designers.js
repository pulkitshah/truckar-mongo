import {
  Box,
  Button,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ExternalLink as ExternalLinkIcon } from "../../icons/external-link";

export const HomeDesigners = (props) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        backgroundColor: "background.paper",
        py: 15,
      }}
      {...props}
    >
      <Container maxWidth="lg">
        <Grid alignItems="center" container justifyContent="center" spacing={3}>
          <Grid item md={6} sm={8} xs={12}>
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
                alt="For designers"
                src={`/static/home/designers_${theme.palette.mode}.png`}
              />
            </Box>
          </Grid>
          <Grid item md={6} xs={12}>
            <Typography variant="h3">Benefits of using Truckar</Typography>
            <Typography
              color="textSecondary"
              sx={{ my: 3 }}
              variant="subtitle1"
            >
              With Truckar clients can easily digitize their current book based
              systems. Our software is designed to replicate the current offline
              systems used by most trucking companies. This is aimed at reducing
              the learning time required for operating the software thus
              ensuring a smooth onboarding for all clients.
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                m: -1,
              }}
            >
              <List dense={true}>
                <ListItem>
                  <Typography color="textSecondary" variant="subtitle1">
                    - Automation of all business operations
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography color="textSecondary" variant="subtitle1">
                    - Time Management
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography color="textSecondary" variant="subtitle1">
                    - Tracking Trucking Fleets on a single platform
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography color="textSecondary" variant="subtitle1">
                    - Intelligent business insights & analytics
                  </Typography>
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
