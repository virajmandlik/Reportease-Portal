import React from "react";
import img01 from "../../assets/img/team/01.png";
import img02 from "../../assets/img/team/02.png";
import img03 from "../../assets/img/team/03.png";
import img04 from "../../assets/img/team/06.png";
import img07 from "../../assets/img/team/04.png";
import img06 from "../../assets/img/team/05.png";
import TeamOneItem from "./TeamOneItem";

interface TeamMember {
  src: string;
  name: string;
  designation: string;
  linkedin: string;
  github: string;
  instagram: string;
}

const TeamOne: React.FC = () => {
  const team_members: TeamMember[] = [
    {
      src: img01,
      name: "Viraj Mandlik",
      designation: "Team Leader",
      linkedin: "https://linkedin.com/in/virajmandlik",
      github: "https://github.com/virajmandlik",
      instagram: "https://instagram.com/virajmandlik",
    },
    {
      src: img02,
      name: "Guru Dahiphale",
      designation: "Frontend Developer",
      linkedin: "https://linkedin.com/in/gurudahiphale",
      github: "https://github.com/gurudahiphale",
      instagram: "https://instagram.com/gurudahiphale",
    },
    {
      src: img03,
      name: "Vishal Kesharvani",
      designation: "Cloud Engineer",
      linkedin: "https://linkedin.com/in/vishalkesharvani",
      github: "https://github.com/vishalkesharvani",
      instagram: "https://instagram.com/vishalkesharvani",
    },
    {
      src: img04,
      name: "Hanumant Kakde",
      designation: "Backend Developer",
      linkedin: "https://linkedin.com/in/hanumantkakde",
      github: "https://github.com/hanumantkakde",
      instagram: "https://instagram.com/hanumantkakde",
    },
    {
      src: img06,
      name: "Parth Kulkarni",
      designation: "Database Management",
      linkedin: "https://linkedin.com/in/parthkulkarni",
      github: "https://github.com/parthkulkarni",
      instagram: "https://instagram.com/parthkulkarni",
    },
    {
      src: img07,
      name: "Siddhi Chhapre",
      designation: "Backend Developer",
      linkedin: "https://linkedin.com/in/siddhichhapre",
      github: "https://github.com/siddhichhapre",
      instagram: "https://instagram.com/siddhichhapre",
    },
  ];

  return (
    <section className="team-area pt-130">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6">
            <div className="section-title text-center mb-70">
              <span className="sub-title">Our Team</span>
              <h2 className="title">
                The Leadership <br /> <span>Team</span>
              </h2>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          {team_members.map((member, index) => (
            <div key={index} className="col-xl-3 col-md-4 col-sm-6">
              <TeamOneItem item={member} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamOne;
