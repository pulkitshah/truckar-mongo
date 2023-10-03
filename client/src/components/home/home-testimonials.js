import { Avatar, Box, Container, Typography } from "@mui/material";

export const HomeTestimonials = (props) => (
  <Box
    sx={{
      backgroundColor: "primary.main",
      py: 15,
    }}
    {...props}
  >
    <Container
      maxWidth="md"
      sx={{
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography align="center" color="primary.contrastText" variant="h3">
        &quot;Truckar is the best software for a small transport business.&quot;
      </Typography>
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          mt: 3,
        }}
      >
        <Avatar
          src="/static/home/olivier.png"
          sx={{ mr: 2 }}
          variant="rounded"
        />
        <div>
          <Typography color="primary.contrastText" variant="h6">
            Ravi Bhai
          </Typography>
          <Typography color="primary.contrastText" variant="body2">
            MCL Freight and Cargo
          </Typography>
        </div>
      </Box>
    </Container>
  </Box>
);
