import React from "react";
import cn from "classnames";

interface FaqItemProps {
  item: {
    id: string;
    controls: string;
    expanded: boolean;
    btnClass: string;
    contentClass: string;
    title: string;
    details: string;
  };
}

const FaqItem: React.FC<FaqItemProps> = (props) => {
  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={props.item.id}>
        <button
          className={cn("accordion-button", props.item.btnClass)}
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${props.item.controls}`}
          aria-expanded={props.item.expanded}
          aria-controls={props.item.controls}
        >
          {props.item.title}
        </button>
      </h2>
      <div
        id={props.item.controls}
        className={cn("accordion-collapse collapse", props.item.contentClass)}
        aria-labelledby={props.item.id}
        data-bs-parent="#accordionExample"
      >
        <div className="accordion-body">
          <p>{props.item.details}</p>
        </div>
      </div>
    </div>
  );
};

export default FaqItem;
