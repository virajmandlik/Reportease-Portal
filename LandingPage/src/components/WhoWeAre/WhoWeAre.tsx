import React from "react";
import { Link } from "react-router-dom";
// Adjust the import path to be correct based on the folder structure
import backgroundImage from "../../assets/img/images/collab.jpeg"; // Replace with your actual image path

const WhoWeAre: React.FC = () => {
  return (
    <section id="about" className="about-area pt-130 pb-130" style={{ display: 'flex' }}>
      {/* Left Side with Background Image */}
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "35%", // Occupy half of the screen
          height: "55vh", // Full height of the viewport
          borderTopLeftRadius: "10px", // Optional: rounded corners
          borderBottomLeftRadius: "10px", // Optional: rounded corners
          borderTopRightRadius: "", // Optional: rounded corners
          borderBottomRightRadius: "", // Optional: rounded corners
          opacity:"0.7",
          marginLeft:"80px"
        
        }}
      />
      {/* Right Side with Content */}
      <div className="container" style={{ width: "50%", padding: "0 20px" }}>
        <div className="row align-items-center">
          <div className="col-lg-12">
            <div className="about-content wow fadeInRight" data-wow-delay=".2s">
              <div className="section-title mb-30">
                <span className="sub-title">About Us</span>
                <h2 className="title">
                  Streamlining <span>Annual Report</span> Creation for
                  Educational Institutes.
                </h2>
              </div>
              <p>
                We streamline the process of creating comprehensive annual
                reports for educational institutes. From data collection to
                report generation, we offer a complete solution to enhance
                transparency and optimize decision-making.
              </p>
              <Link to="/" className="btn">
                READ MORE
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoWeAre;