import { useEffect } from "react";
import Head from "next/head";
import Router from "next/router";
import { Toaster } from "react-hot-toast";
import { Provider as ReduxProvider } from "react-redux";
import nProgress from "nprogress";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { LocalizationProvider } from "@mui/x-date-pickers";
import "@mui/lab";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { useJsApiLoader } from "@react-google-maps/api";
import { RTL } from "../components/rtl";
import { SplashScreen } from "../components/splash-screen";
import {
  SettingsConsumer,
  SettingsProvider,
} from "../contexts/settings-context";
import { AuthConsumer, AuthProvider } from "../contexts/jwt-context";
import { gtmConfig } from "../config";
import { gtm } from "../lib/gtm";
import { store } from "../store";
import { createTheme } from "../theme";
import { createEmotionCache } from "../utils/create-emotion-cache";
import "../i18n";

//Constants
export const APP_ID = "truckar-estjt";
export const REACT_APP_GOOGLE_MAPS_API_KEY =
  "AIzaSyDxGCC86EWkjtOccLqVDZKcw-yii2YHcmU";
const libraries = ["places"];
let isGoogleLoaded = false;

Router.events.on("routeChangeStart", nProgress.start);
Router.events.on("routeChangeError", nProgress.done);
Router.events.on("routeChangeComplete", nProgress.done);

const clientSideEmotionCache = createEmotionCache();

const App = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  // Loading Google Maps API
  try {
    const { isLoaded } = useJsApiLoader({
      googleMapsApiKey: REACT_APP_GOOGLE_MAPS_API_KEY,
      libraries: libraries,
    });

    if (!isLoaded) {
      // console.log("Google Maps Loading");
    } else {
      isGoogleLoaded = true;
    }
    // Loading Google Maps API //
  } catch (error) {
    console.log(error);
  }

  const getLayout = Component.getLayout ?? ((page) => page);

  useEffect(() => {
    gtm.initialize(gtmConfig);
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <title>Truckar</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ReduxProvider store={store}>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <AuthProvider appId={APP_ID}>
            <SettingsProvider>
              <SettingsConsumer>
                {({ settings }) => (
                  <ThemeProvider
                    theme={createTheme({
                      direction: settings.direction,
                      responsiveFontSizes: settings.responsiveFontSizes,
                      mode: settings.theme,
                    })}
                  >
                    <RTL direction={settings.direction}>
                      <CssBaseline />
                      <Toaster position="top-center" />
                      {/* <SettingsButton /> */}
                      <AuthConsumer>
                        {(auth) =>
                          !auth.isInitialized ? (
                            <SplashScreen />
                          ) : (
                            getLayout(<Component {...pageProps} />)
                          )
                        }
                      </AuthConsumer>
                    </RTL>
                  </ThemeProvider>
                )}
              </SettingsConsumer>
            </SettingsProvider>
            {/* </RealmApolloProvider> */}
          </AuthProvider>
        </LocalizationProvider>
      </ReduxProvider>
    </CacheProvider>
  );
};

export default App;
