import React from "react";
import downloadImg from "../../assets/img/images/download_img.png";
import downloadBtn01 from "../../assets/img/images/download_btn01.png";
import downloadBtn02 from "../../assets/img/images/download_btn02.png";

const DownloadArea: React.FC = () => {
  return (
    <section className="download-area pt-150 pb-140">
      <div className="container custom-container-four">
        <div className="row align-items-center">
          <div className="col-xl-7 col-lg-6 order-0 order-lg-2">
            <div
              className="download-img text-center wow fadeInRight"
              data-wow-delay=".2s"
            >
              <img src={downloadImg} alt="Download" />
            </div>
          </div>
          <div className="col-xl-5 col-lg-6">
            <div
              className="download-content wow fadeInLeft"
              data-wow-delay=".2s"
            >
              <div className="section-title section-title-two mb-20">
                <span className="sub-title">Download ICO App</span>
                <h2 className="title">
                  You can trading, control, buy and sell from your mobile
                </h2>
              </div>
              <p>
                The World’s 1st ICO Platform That Offers Rewards and helps
                investors make things easier.
              </p>
              <div className="download-btn">
                <a href="#">
                  <img src={downloadBtn01} alt="Download on App Store" />
                </a>
                <a href="#">
                  <img src={downloadBtn02} alt="Get it on Google Play" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DownloadArea;
