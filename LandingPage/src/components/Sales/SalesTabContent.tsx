import React from "react";
import { Link } from "react-router-dom";
import cn from "classnames";

interface SalesTabContentProps {
  className: string;
  id: string;
  ariaLabel: string;
  title: string;
  description: string;
  link: string;
}

const SalesTabContent: React.FC<SalesTabContentProps> = (props) => {
  return (
    <div
      className={cn("tab-pane fade", props.className)}
      id={props.id}
      role="tabpanel"
      aria-labelledby={props.ariaLabel}
    >
      <div className="chart-content-inner">
        <h2 className="title">{props.title}</h2>
        <p>{props.description}</p>
        <Link to={props.link} className="btn">
          Buy Now
        </Link>
      </div>
    </div>
  );
};

export default SalesTabContent;
