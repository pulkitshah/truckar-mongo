import { useEffect } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { Box, Card, Container, Divider, Link, Typography } from "@mui/material";
import { GuestGuard } from "../../components/authentication/guest-guard";
import { JWTLogin } from "../../components/authentication/jwt-login";
import { Logo } from "../../components/logo";
import { useAuth } from "../../hooks/use-auth";
import { gtm } from "../../lib/gtm";

const platformIcons = {
  Amplify: "/static/icons/amplify.svg",
  Auth0: "/static/icons/auth0.svg",
  Firebase: "/static/icons/firebase.svg",
  JWT: "/static/icons/jwt.svg",
};

const Login = () => {
  const router = useRouter();
  const { platform } = useAuth();
  const { disableGuard } = router.query;

  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Head>
        <title>Login | Truckar</title>
      </Head>
      <Box
        component="main"
        sx={{
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            py: {
              xs: "60px",
              md: "120px",
            },
          }}
        >
          <Card elevation={16} sx={{ p: 4 }}>
            <Box
              sx={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <NextLink href="/" passHref>
                <a>
                  <Logo
                    sx={{
                      height: 40,
                      width: 40,
                    }}
                  />
                </a>
              </NextLink>
              <Typography variant="h4">Log in</Typography>
              <Typography color="textSecondary" sx={{ mt: 2 }} variant="body2">
                Log in on the internal platform
              </Typography>
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                mt: 3,
              }}
            >
              {platform === "JWT" && <JWTLogin />}
            </Box>
            <Divider sx={{ my: 3 }} />
            <NextLink
              href={
                disableGuard
                  ? `/authentication/register?disableGuard=${disableGuard}`
                  : "/authentication/register"
              }
              passHref
            >
              <Link color="textSecondary" variant="body2">
                Create new account
              </Link>
            </NextLink>
            <Box
              sx={{
                flexGrow: 1,
                mt: 3,
              }}
            >
              {platform === "Amplify" && (
                <NextLink
                  href={
                    disableGuard
                      ? `/authentication/password-recovery?disableGuard=${disableGuard}`
                      : "/authentication/password-recovery"
                  }
                  passHref
                >
                  <Link
                    align="right"
                    color="textSecondary"
                    sx={{ mt: 1 }}
                    variant="body2"
                  >
                    Forgot password
                  </Link>
                </NextLink>
              )}
            </Box>
          </Card>
        </Container>
      </Box>
    </>
  );
};

Login.getLayout = (page) => <GuestGuard>{page}</GuestGuard>;

export default Login;
