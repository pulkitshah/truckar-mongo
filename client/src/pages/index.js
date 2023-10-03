import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { Divider } from "@mui/material";
import { MainLayout } from "../components/main-layout";
import { HomeClients } from "../components/home/home-clients";
import { HomeHero } from "../components/home/home-hero";
import { HomeDevelopers } from "../components/home/home-developers";
import { HomeDesigners } from "../components/home/home-designers";
import { HomeFeatures } from "../components/home/home-features";
import { HomeTestimonials } from "../components/home/home-testimonials";
import { gtm } from "../lib/gtm";

const Home = () => {
  useEffect(() => {
    gtm.push({ event: "page_view" });
  }, []);

  return (
    <>
      <Helmet>
        <title>Transport & Logistics Software | Trucking TMS | Truckar</title>
        <meta
          name="description"
          content="Leading Developers Of Transport & Logistics Software. Integrated Solutions For Trucing & Fleet Management"
        />
        <meta
          name="keywords"
          content="Transport Management Software,Vehicle Fleet Management System,Trucking TMS,Transport & Logistics Software"
        />
      </Helmet>
      <main>
        <HomeHero />
        <Divider />
        <HomeFeatures />
        <HomeDevelopers />
        <Divider />
        <HomeDesigners />
        <HomeTestimonials />
        <Divider />
        <HomeClients />
      </main>
    </>
  );
};

Home.getLayout = (page) => <MainLayout>{page}</MainLayout>;

export default Home;
