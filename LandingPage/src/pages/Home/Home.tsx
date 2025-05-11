import React from "react";
import Banner from "../../components/Banner/Banner";
import ContactOne from "../../components/Contact/ContactOne";
import Roadmap from "../../components/Roadmap/Roadmap";
import Sales from "../../components/Sales/Sales";
import TeamOne from "../../components/Team/TeamOne";
import WhoWeAre from "../../components/WhoWeAre/WhoWeAre";
import WhyChooseUs from "../../components/WhyChooseUs/WhyChooseUs";
import LayoutOne from "../../layouts/LayoutOne";
import aboutImg from "../../assets/img/images/about_img01.png"; // Image path import
import MOA from "../../components/MOA/MOA";

const Home: React.FC = () => {
  return (
    <LayoutOne>
      <main className="fix">
        <Banner />
        {/* Pass the imgSrc prop here with the correct path */}
        <WhoWeAre />
        <WhyChooseUs />
        <Sales />
        <div className="area-bg">
          <Roadmap />
        </div>
       {/* <MOA/> */}
        {/* <TeamOne /> */}
        <ContactOne />
      </main>
    </LayoutOne>
  );
};

export default Home;
