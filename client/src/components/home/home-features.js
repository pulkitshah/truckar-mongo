import { useState } from "react";
import {
  Avatar,
  Box,
  Container,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Cog as CogIcon } from "../../icons/cog";
import { Lock as LockIcon } from "../../icons/lock";
import { MinusOutlined as MinusOutlinedIcon } from "../../icons/minus-outlined";
import { Template as TemplateIcon } from "../../icons/template";

const getFeatures = (theme) => [
  {
    icon: LockIcon,
    image: `/static/home/auth_${theme}.png`,
    items: [],
    subheader:
      "The current invoice tracking mechanism is time consuming and inefficient. To add to the confusion there is often duplication of Lorry receipts & invoices. Our digital interface eliminate these pain points.",
    title: "Digital LR & Invoices",
  },
  {
    icon: CogIcon,
    items: [],
    subheader:
      "With Truckar you can track , monitor, and manage the vehicle fleet form a single interface. This help in planning routes and scheduling vehicle repairs and maintenance.",
    image: `/static/home/flows_${theme}.png`,
    title: "Tracking Vehicle Performance",
  },
  {
    icon: TemplateIcon,
    image: `/static/home/landing_${theme}.png`,
    items: [],
    subheader:
      "Managing multiple drivers across multiple trucks can sometimes get extremely tedious. With Truckar driver- truck mapping becomes a lot easier. Maintain all expenses of drivers at one place",
    title: "Driver Management",
  },
  {
    icon: TemplateIcon,
    image: `/static/home/landing_${theme}.png`,
    items: [],
    subheader:
      "Expenses can present in multiple formats by multiple partis. Truckar provides a uniform interface to manage expense across various stakeholders.",
    title: "Expense Tracking",
  },
  {
    icon: TemplateIcon,
    image: `/static/home/landing_${theme}.png`,
    items: [],
    subheader:
      "Truckar provides a digital register to manage your pipeline of orders. Past orders, current orders and upcoming orders are all available on a single interface.",
    title: "Digital Register",
  },
];

export const HomeFeatures = (props) => {
  const theme = useTheme();
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = getFeatures(theme.palette.mode);

  const handleChangeFeature = (index) => {
    setSelectedFeature(index);
  };

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        py: 15,
      }}
      {...props}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <Typography variant="h3">Features</Typography>
            <Typography
              color="textSecondary"
              sx={{ py: 2 }}
              variant="subtitle1"
            >
              We have designed Truckar to ensure all current pain points faced
              by owners & operators are addressed.
            </Typography>
            {features.map((feature, index) => {
              const { icon: Icon, items, subheader, title } = feature;

              const selected = index === selectedFeature;

              return (
                <Box
                  key={title}
                  onClick={() => handleChangeFeature(index)}
                  sx={{
                    backgroundColor:
                      selected && alpha(theme.palette.primary.main, 0.08),
                    borderRadius: 1,
                    cursor: selected ? "default" : "pointer",
                    display: "flex",
                    mb: 2,
                    p: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      backgroundColor: selected && "primary.main",
                      color: selected && "primary.contrastText",
                      mr: 2,
                    }}
                  >
                    <Icon fontSize="small" />
                  </Avatar>
                  <div>
                    <Typography variant="h6">{title}</Typography>
                    <Typography color="textSecondary" variant="body2">
                      {subheader}
                    </Typography>
                    {selected && (
                      <List
                        disablePadding
                        sx={{
                          display: "grid",
                          gridTemplateColumns: items.length > 4 && {
                            sm: "repeat(2, 1fr)",
                          },
                          gap: 1,
                          pt: 2,
                        }}
                      >
                        {items.map((item) => (
                          <ListItem disableGutters key={item} sx={{ py: 0 }}>
                            <ListItemAvatar
                              sx={{
                                alignItems: "center",
                                display: "flex",
                                minWidth: 0,
                                mr: 0.5,
                              }}
                            >
                              <MinusOutlinedIcon color="primary" />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2">
                                  {item}
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </div>
                </Box>
              );
            })}
          </Grid>
          <Grid item md={6} xs={12}>
            <Box
              sx={{
                position: "relative",
                pt: "calc(965 / 1224 * 100%)",
                "& img": {
                  height: "auto",
                  position: "absolute",
                  top: 100,
                  width: "100%",
                },
              }}
            >
              <img alt="" src={features[selectedFeature].image} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
