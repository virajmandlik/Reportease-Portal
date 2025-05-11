import React from "react";

interface TeamMember {
  src: string;
  name: string;
  designation: string;
  linkedin: string;
  github: string;
  instagram: string;
}

interface TeamOneItemProps {
  item: TeamMember;
}

const TeamOneItem: React.FC<TeamOneItemProps> = ({ item }) => {
  return (
    <div className="team-item">
      <div className="team-thumb">
        <img src={item.src} alt={item.name} />
      </div>
      <div className="team-content">
        <h2 className="title">{item.name}</h2>
        <span>{item.designation}</span>

        <ul className="team-social">
          <li>
            <a href={item.linkedin} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
          </li>
          <li>
            <a href={item.github} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
          </li>
          <li>
            <a href={item.instagram} target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TeamOneItem;
