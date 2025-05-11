import React, { useEffect, useState } from "react";
import shape01 from "../../assets/img/banner/logo.png"; // Ensure this path is correct
import shape02 from "../../assets/img/banner/SIH_LOGO.png"; // Add the right-side image path
import CountDownOne from "../CountDown/CountDownOne";

interface BannerProps {
  // Define any props if needed here
}

const Banner: React.FC<BannerProps> = (props) => {
  // State to store the current date
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    // Function to get the current date in the format 'DD MMMM YYYY'
    const getCurrentDate = () => {
      const today = new Date();
      const day = today.getDate();
      const month = today.toLocaleString('default', { month: 'long' });
      const year = today.getFullYear();
      return `${day < 10 ? '0' + day : day} ${month} ${year}`;
    };

    // Set the current date when the component mounts
    setCurrentDate(getCurrentDate());

    // Optional: If you want the date to update every day (even when the component is still mounted), you could use a setInterval
    const interval = setInterval(() => {
      setCurrentDate(getCurrentDate());
    }, 86400000); // Update every 24 hours (86400000 milliseconds)

    // Clear interval on component unmount to prevent memory leaks
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="banner-area banner-bg">
      <div className="banner-shape-wrap">
        {/* <img src={shape01} alt="Banner Shape Left" className="img-one" /> */}
        {/* <img src={shape02} alt="Banner Shape Right" className="img-two" />  */}
      </div>
      <br />
      <br />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="banner-content text-center">
              <h2 className="title">
                 <span>REPORTEASE</span> <br /> REPORT GENERATOR PORTAL
              </h2>
            </div>
            <div className="banner-progress-wrap">
              <ul>
                <li>Organize</li>
                <li>Analyze</li>
                <li>Achieve</li>
              </ul>
              <div className="progress">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{ width: "92%" }}
                  aria-valuenow={75}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <h4 className="title">
                Simplify Reporting Processes <span>Enhance Decision-Making Power</span>
              </h4>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="banner-countdown-wrap text-center">
              <h2 className="title">{currentDate}</h2>
              <CountDownOne />
            </div>
          </div>
        </div> <br /><br /><br /><br /><br /><br />
      </div>
    </section>
  );
};

export default Banner;