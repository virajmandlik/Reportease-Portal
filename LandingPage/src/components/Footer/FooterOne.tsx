import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../../assets/img/logo/logo.png";
import { scrollToTop } from "../../lib/helpers";  // Only keep this import

const FooterOne: React.FC = () => {
  return (
    <footer>
      <div className="footer-area">
        <div className="container">
          <div className="footer-scroll-wrap">
            <button
              className="scroll-to-target"
              data-target="html"
              onClick={scrollToTop}
            >
              <i className="fas fa-arrow-up"></i>
            </button>
          </div>
          <div className="footer-top">
            <div className="row">
              <div className="col-xl-3 col-lg-4 col-md-6"> <br />
                <div
                  className="footer-widget wow fadeInUp"
                  data-wow-delay=".2s"
                >
                 <Link to="/">
                  <span className="text-2xl font-bold">
                    <span className="text-blue-500">Team </span>
                        <span className="text-white-700">SHASHWAT</span>
                      </span>
                  </Link> <br /><br />  
                  <div className="footer-content">
                    <p>
                    Simplify annual reports, boost transparency, enhance collaboration, and secure data management for educational institutes!
                    </p>
                    <ul className="footer-social">
                      <li>
                        <a href="https://www.instagram.com/ministryofayush/">
                          <i className="fab fa-instagram"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://x.com/moayush">
                          <i className="fab fa-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.facebook.com/moayush">
                          <i className="fab fa-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.youtube.com/@MinistryofAYUSHofficial/videos?themeRefresh=1">
                          <i className="fab fa-youtube"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-5 col-sm-6">
                <div
                  className="footer-widget  wow fadeInUp"
                  data-wow-delay=".4s"
                >
                  <h4 className="fw-title">Useful Links</h4>
                  <div className="footer-link">
                    <ul>
                      <li>
                        <Link to="/">Contact us</Link>
                      </li>
                      <li>
                        <Link to="/">How it Works</Link>
                      </li>
                      <li>
                        <Link to="/">Create</Link>
                      </li>
                      <li>
                        <Link to="/">Explore</Link>
                      </li>
                      <li>
                        <Link to="/">Terms & Services</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-2 col-lg-3 col-sm-6">
                <div
                  className="footer-widget wow fadeInUp"
                  data-wow-delay=".6s"
                >
                  <h4 className="fw-title">Community</h4>
                  <div className="footer-link">
                    <ul>
                      <li>
                        <Link to="/">Help Center</Link>
                      </li>
                      <li>
                        <Link to="/">Partners</Link>
                      </li>
                      <li>
                        <Link to="/">Suggestions</Link>
                      </li>
                      <li>
                        <Link to="/">Blog</Link>
                      </li>
                      <li>
                        <Link to="/">Newsletters</Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 col-lg-4 col-md-6">
                <div
                  className="footer-widget wow fadeInUp"
                  data-wow-delay=".8s"
                >
                  <h4 className="fw-title">Subscribe Newsletter</h4>
                  <div className="footer-newsletter">
                    <p>
                    Simplifying reports, enhancing transparency, and securing data for educational institutes!
                    </p>
                    <form action="#">
                      <input
                        type="email"
                        placeholder="teamshashwat2704@gmail.com"
                        required
                      />
                      <button type="submit">
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="copyright-text">
                  <p>Copyright &copy; Team Shashwat. All Rights Reserved
</p>
                </div>
              </div>
              <div className="col-lg-6 d-none d-sm-block">
                <div className="footer-menu">
                  <ul>
                    <li>
                      <Link to="#">Terms and conditions</Link>
                    </li>
                    <li>
                      <Link to="#">Privacy policy</Link>
                    </li>
                    <li>
                     
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterOne;
