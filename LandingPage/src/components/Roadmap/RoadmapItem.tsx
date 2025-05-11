import React from "react";

interface RoadmapItemProps {
  item: {
    roadmapTitle: string;
    title: string;
    info: string[];
  };
}

const RoadmapItem: React.FC<RoadmapItemProps> = ({ item }) => {
  return (
    <div className="bt-roadmap-item">
      <span className="roadmap-title">{item.roadmapTitle}</span>
      <div className="roadmap-content">
        <span className="dot" />
        <h4 className="title">{item.title}</h4>

        {item.info.map((x, index) => (
          <span key={index}>{x}</span>
        ))}
      </div>
    </div>
  );
};

export default RoadmapItem;
