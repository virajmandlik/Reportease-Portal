import React, { useEffect, useState } from "react";
import SlickSlider from "../SlickSlider/SlickSlider";
import icon01 from "../../assets/img/icon/1-removebg-preview (1).png";
import icon02 from "../../assets/img/icon/2-removebg-preview.png";
import icon03 from "../../assets/img/icon/3-removebg-preview.png";
import icon04 from "../../assets/img/icon/4-removebg-preview (1).png";
import icon05 from "../../assets/img/icon/5-removebg-preview.png";
import icon06 from "../../assets/img/icon/6-removebg-preview.png";
import icon07 from "../../assets/img/icon/7-removebg-preview.png";
import icon08 from "../../assets/img/icon/8-removebg-preview.png";
import icon09 from "../../assets/img/icon/9-removebg-preview.png";
import icon010 from "../../assets/img/icon/10-removebg-preview.png";
import icon11 from "../../assets/img/icon/11-removebg-preview.png";
import icon12 from "../../assets/img/icon/12-removebg-preview.png";
import WhyChooseUsItem from "../WhyChooseUs/WhyChooseUsItem";

interface SliderItem {
  src: string;
  alt: string;
  link: string;
  title: React.ReactNode;
  description: string;
  buttonLink: string; // New property for button link
}

const MOA: React.FC = () => {
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
      alt: "All India Institute of Ayurveda (AIIA), New Delhi",
      link: "/",
      title: "All India Institute of Ayurveda (AIIA), New Delhi",
      description: "",
      buttonLink: "/https://aiia.gov.in/",
    },
    {
      src: icon02,
      alt: "Central Ayurveda Research Institute, Bengaluru",
      link: "/",
      title: "Central Ayurveda Research Institute, Bengaluru",
      description: "",
      buttonLink: "https://cari.gov.in/",
    },
    {
      src: icon03,
      alt: "Institute of Teaching and Research in Ayurveda (ITRA), Jamnagar ",
      link: "/",
      title: <>Institute of Teaching and Research in Ayurveda (ITRA), Jamnagar</>,
      description: "",
      buttonLink: "https://itra.ac.in/",
    },
    {
      src: icon04,
      alt: "Morarji Desai National Institute of Yoga (MDNIY), New Delhi",
      link: "/",
      title: "Morarji Desai National Institute of Yoga (MDNIY), New Delhi",
      description: "",
      buttonLink: "https://www.yogamdniy.nic.in/",
    },
    {
      src: icon05,
      alt: "National Institute of Ayurveda, Jaipur ",
      link: "/",
      title: "National Institute of Ayurveda, Jaipur",
      description: "",
      buttonLink: "https://nia.nic.in/",
    },
    {
      src: icon06,
      alt: "National Institute of Naturopathy, Pune ",
      link: "/",
      title: <>National Institute of Naturopathy, Pune </>,
      description: "",
      buttonLink: "https://ninpune.ayush.gov.in/",
    },
    {
      src: icon07,
      alt: "National Institute of Sowa Rigpa (NISR), Leh",
      link: "/",
      title: "National Institute of Sowa Rigpa (NISR), Leh",
      description: "",
      buttonLink: "https://www.sowarigpainstitute.in/",
    },
    {
      src: icon08,
      alt: "National Institute of Unani Medicine (NIUM), Bangalore",
      link: "/",
      title: "National Institute of Unani Medicine (NIUM), Bangalore",
      description: "",
      buttonLink: "http://www.nium.in/",
    },
    {
      src: icon09,
      alt: "North Eastern Institute of Ayurveda and Folk Medicine Research",
      link: "/",
      title: "North Eastern Institute of Ayurveda and Folk Medicine Research",
      description: "",
      buttonLink: "https://neiafmr.org.in/",
    },
    {
      src: icon010,
      alt: "North Eastern Institute of Ayurveda and Homoeopathy (NEIAH), Shillong",
      link: "/",
      title: "North Eastern Institute of Ayurveda and Homoeopathy (NEIAH), Shillong",
      description: "",
      buttonLink: "https://neiah.nic.in/",
    },
    {
      src: icon11,
      alt: "National Institute of Homoeopathy, Kolkata",
      link: "/",
      title: "National Institute of Homoeopathy, Kolkata",
      description: "",
      buttonLink: "https://nih.nic.in/",
    },
    {
      src: icon12,
      alt: "Rashtriya Ayurveda Vidyapeeth, Delhi",
      title: "Rashtriya Ayurveda Vidyapeeth, Delhi",
      link: "/",
      description: "",
      buttonLink: "https://ravdelhi.nic.in/",
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
      <br />
      <br />
      <br />
      <br />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6">
            <div className="section-title text-center mb-50 ">
              <span className="sub-title"> Institutes falls under</span>
              <h2 className="title">
               <span> MINISTRY OF AYUSH</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="row choose-active">
            <SlickSlider settings={slickSettings}>
            {sliderItems.map((item, index) => (
  <div key={index} className="col-lg-3">
    <WhyChooseUsItem item={item} />
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      <button
        style={{
          padding: "8px 12px",
          fontSize: "14px",
          
          color: "black",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "fit-content",
        }}
        onClick={() => window.location.href = item.buttonLink}
      >
        Learn More
      </button>
    </div>
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

export default MOA;