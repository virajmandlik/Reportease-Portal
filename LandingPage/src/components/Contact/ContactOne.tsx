import React from "react";
import ContactOneForm from "./ContactOneForm";
import ContactOneInfoItem from "./ContactOneInfoItem";

interface InfoItem {
  icon: string;
  content: React.ReactNode; // This allows any React content, like strings or JSX elements
}

const ContactOne: React.FC = () => {
  const info_items: InfoItem[] = [
    {
      icon: "fa-envelope",
      content: (
        <>
         teamshashwat2704@gmail.com
        </>
      ),
    },
    {
      icon: "fa-phone",
      content: (
        <>
          +91 87670 34269
          <br /> +91 79725 91242
        </>
      ),
    },
    {
      icon: "fa-map-marker-alt",
      content: (
        <>
          Pune - 412105
        </>
      ),
    },
  ];

  return (
    <section id="contact" className="contact-area pt-70 pb-110">
      <div className="container">
        {/* section title */}
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="section-title text-center mb-70">
              <span className="sub-title">Contact</span>
              <h2 className="title">
                <span>Contact</span> Us
              </h2>
            </div>
          </div>
        </div>

        {/* section info */}
        <div className="contact-info-wrap">
          <div className="row justify-content-center">
            {info_items.map((x, index) => (
              <div key={index} className="col-lg-4 col-sm-6">
                <ContactOneInfoItem item={x} />
              </div>
            ))}
          </div>
        </div>

        {/* section form */}
        <ContactOneForm />
      </div>
    </section>
  );
};

export default ContactOne;
