import React from "react";
import cn from "classnames";

interface ContactInfoItemProps {
  item: {
    icon: string;
    content: React.ReactNode;
  };
}

const ContactOneInfoItem: React.FC<ContactInfoItemProps> = ({ item }) => {
  return (
    <div className="contact-info-item">
      <div className="icon">
        <span className="icon-background"></span>
        <i className={cn("fas", item.icon)}></i>
      </div>
      <div className="content">
        <p>{item.content}</p>
      </div>
    </div>
  );
};

export default ContactOneInfoItem;
