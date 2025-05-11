import React from "react";
import { useHorizontalScroll } from "../../lib/hooks/useHorizontalScroll";
import RoadmapItem from "./RoadmapItem";

interface RoadmapItemType {
  roadmapTitle: string;
  title: string;
  info: string[];
}

const Roadmap: React.FC = () => {
  const roadmap_items: RoadmapItemType[] = [
    {
      roadmapTitle: "Phase 1 ",
      title: "User Onboarding",
      info: [
        "Setup user registration & login.",
        "Implement role-based access.",
      ],
    },
    {
      roadmapTitle: "Phase 2 ",
      title: "Role-based Data Management",
      info: [
        "Define roles for users.",
        "Enable feedback collection.",
      ],
    },
    {
      roadmapTitle: "Phase 3 ",
      title: "Report Workflow Implementation",
      info: [
        "Create reporting system.",
        "Enable feedback integration.",
      ],
    },
    {
      roadmapTitle: "Phase 4 ",
      title: "Notification System",
      info: [
        "Implement real-time notifications.",
        "Alert stakeholders about updates.",
      ],
    },
    {
      roadmapTitle: "Phase 5  ",
      title: "Encryption & Access Control",
      info: [
        "Secure data with encryption.",
        "Enhance role-based security.",
      ],
    },
    {
      roadmapTitle: "Phase 6 ",
      title: "Stakeholder Report Submission",
      info: [
        "Securely submit reports.",
        "Automate validation & feedback.",
      ],
    },
    {
      roadmapTitle: "Phase 7 ",
      title: "Final Deployment & Scalability",
      info: [
        "Scale system for multiple institutions.",
        "Gather user feedback and optimize.",
      ],
    },
  ];

  const scrollRef = useHorizontalScroll() as React.RefObject<HTMLDivElement>;

  return (
    <section id="roadmap" className="roadmap-area pt-130 pb-130">
      <div className="container custom-container-two">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-lg-8">
            <div className="section-title text-center mb-60">
              <span className="sub-title">Our Roadmap</span>
              <h2 className="title">
                <span>REPORTEASE</span> Strategy and <br /> Project Plan
              </h2>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div
              className="bt-roadmap_x bt-roadmap-scrollbar"
              ref={scrollRef}
              style={{ overflowX: "auto", whiteSpace: "nowrap" }}
            >
              <div className="bt-roadmap-wrap d-flex">
                {roadmap_items.map((item, index) => (
                  <RoadmapItem key={index} item={item} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div> 
    </section>
  );
};

export default Roadmap;
