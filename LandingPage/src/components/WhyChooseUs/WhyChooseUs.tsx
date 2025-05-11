import React, { useEffect, useState } from "react";
import SlickSlider from "../SlickSlider/SlickSlider";
// Updated image imports
import icon01 from "../../assets/img/icon/choose_icon01.svg";  // Ensure the relative path is correct
import icon02 from "../../assets/img/icon/choose_icon02.svg";
import icon03 from "../../assets/img/icon/choose_icon03.svg";
import icon04 from "../../assets/img/icon/choose_icon04.svg";
import WhyChooseUsItem from "./WhyChooseUsItem";

interface SliderItem {
  src: string;
  alt: string;
  link: string;
  title: React.ReactNode;
  description: string;
}

const WhyChooseUs: React.FC = () => {
  const slickSettings = {
    dots: false,
    infinite: true,
    speed: 1000,
    autoplay: true,
    arrows: false,
    slidesToShow: 4,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3, slidesToScroll: 1, infinite: true },
      },
      {
        breakpoint: 992,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 767,
        settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false },
      },
      {
        breakpoint: 575,
        settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false },
      },
    ],
  };

  const sliderItems: SliderItem[] = [
    {
      src: icon01,
      alt: "Comprehensive Data Integration",
      link: "/",
      title: "Comprehensive Data Integration",
      description: "Unify data from all departments for accurate reports.",
    },
    {
      src: icon02,
      alt: "Customizable Reporting",
      link: "/",
      title: "Customizable Reporting",
      description: "Create reports tailored to your institution's needs.",
    },
    {
      src: icon03,
      alt: "Role-Based Dashboards",
      link: "/",
      title: <>Role-Based Dashboards</>,
      description: "Collaborate effectively with real-time data sharing.",
    },
    {
      src: icon04,
      alt: "Enhanced Transparency",
      link: "/",
      title: "Enhanced Transparency",
      description: "Boost accountability with streamlined reporting.",
    },
    {
      src: icon01,
      alt: "Automated Reporting",
      link: "/",
      title: "Automated Reporting",
      description: "Save time with automated and accurate report generation.",
    },
    {
      src: icon03,
      alt: "Real-Time Collaboration",
      link: "/",
      title: <>Real-Time Collaboration</>,
      description: "Enable real-time updates and feedback among teams.",
    },
    {
      src: icon04,
      alt: "Secure Data Management",
      link: "/",
      title: "Secure Data Management",
      description: "Protect data with robust encryption and security tools.",
    },
  ];
  

  const initialState = 0;
  const [count, setCount] = useState<number>(initialState);
  const toMultiply = 100 / sliderItems.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev === sliderItems.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderItems.length]);

  return (
    <section className="choose-area pb-80">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6">
            <div className="section-title text-center mb-50">
              <span className="sub-title">Why Choose Us</span>
              <h2 className="title">
                Why choose our PLATFORM <span></span>
              </h2>
            </div>
          </div>
        </div>

        <div className="row choose-active">
          <SlickSlider settings={slickSettings}>
            {sliderItems.map((item, index) => (
              <div key={index} className="col-lg-3">
                <WhyChooseUsItem item={item} />
              </div>
            ))}
          </SlickSlider>
        </div>

        <div className="slide-progressbar">
          <div
            style={{
              backgroundSize: `${count * toMultiply}% 100%`,
            }}
            className="slide-filler"
          />
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
