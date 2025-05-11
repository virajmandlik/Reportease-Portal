import React from "react";
import { Link } from "react-router-dom";

interface WhyChooseUsItemProps {
  item: {
    src: string;
    alt: string;
    link: string;
    title: React.ReactNode;
    description: string;
  };
}

const WhyChooseUsItem: React.FC<WhyChooseUsItemProps> = ({ item }) => {
  return (
    <div className="choose-item">
      <div className="choose-icon">
        <img src={item.src} alt={item.alt} />
      </div>
      <div className="choose-content">
        <h2 className="title">
          <Link to={item.link}>{item.title}</Link>
        </h2>
        <p>{item.description}</p>
      </div>
    </div>
  );
};

export default WhyChooseUsItem;
