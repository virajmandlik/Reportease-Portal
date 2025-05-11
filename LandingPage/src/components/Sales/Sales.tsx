import React, { useEffect, useState } from "react";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  gif: string;
}

const WorkflowComponentWithGIFs: React.FC = () => {
  const workflowSteps: WorkflowStep[] = [
    {
      id: "execution",
      title: "Dynamic Permission Management",
      description: "",
      gif: "/gifs/diagram.gif",
    },
    {
      id: "accepted-200",
      title: "User -Based Access Control",
      description: "",
      gif: "/gifs/social-media.gif",
    },
    {
      id: "submitted-110",
      title: "Customizable Dashboards",
      description: "",
      gif: "/gifs/line-chart.gif",
    },
    {
      id: "integration-visited",
      title: "Generate Selectable Reports",
      description: "",
      gif: "/gifs/document.gif",
    },
    {
      id: "final-accepted",
      title: "Download Reports in Multiple Formats",
      description: "",
      gif: "/gifs/generate_pdf.gif",
    },
    {
      id: "final-accepted",
      title: "Maintain User Access Log",
      description: "",
      gif: "/gifs/7211842.gif",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [enlargedCard, setEnlargedCard] = useState<number>(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const transitionEffect = () => {
      const nextIndex = (activeIndex + 1) % workflowSteps.length;

      // Simulate zoom effect transition
      setEnlargedCard(activeIndex);

      setTimeout(() => {
        setActiveIndex(nextIndex);
        setEnlargedCard(nextIndex);
      }, 2000); // 1-second delay for transition

      interval = setInterval(() => {
        setEnlargedCard(nextIndex);

        const nextTransition = (nextIndex + 1) % workflowSteps.length;
        setTimeout(() => setActiveIndex(nextTransition), 4000);
      }, 4000);
    };

    transitionEffect();

    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <section id="workflow" className="workflow-section py-5">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-5">
          <h1
            className="mb-3"
            style={{ fontWeight: "bold", fontSize: "2.5rem", color: "#05c5db" }}
          >
            Workflow of PORTAL
          </h1>
          <p className="lead" style={{ color: "white" }}>
            Streamlining the process end-to-end with stages of execution.
          </p><br /><br />
        </div>

        {/* Workflow Steps with transition effects */}
        <div className="workflow-steps-container">
          {workflowSteps.map((step, index) => (
            <div
              className={`workflow-step-container ${
                enlargedCard === index ? "enlarged-card" : ""
              }`}
              key={step.id}
            >
              {/* Card with GIFs */}
              <div className="workflow-step">
                <div className="gif-container">
                  <img
                    src={step.gif}
                    alt={step.title}
                    className="workflow-gif"
                  />
                </div>
                <div className="workflow-info">
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
              {/* Arrow pointing to the next card */}
              {index < workflowSteps.length - 1 && (
                <div
                  className={`arrow ${
                    index === enlargedCard  ? "visible" : "hidden"
                  }`}
                >
                  ➜
                </div>
              )}
            </div>
          ))}
        </div>
      </div> <br /><br />
    </section>
  );
};

export default WorkflowComponentWithGIFs;