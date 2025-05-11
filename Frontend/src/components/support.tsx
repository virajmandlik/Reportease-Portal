
// // import React, { useState } from 'react';

// // // Type definition for each FAQ item
// // interface FAQ {
// //   question: string;
// //   answer: string;
// // }

// // // Sample FAQs
// // const faqs: FAQ[] = [
// //   {
// //     question: "How do I generate the annual report?",
// //     answer: "Login to your account, input necessary data, and click 'Generate Report'. The system processes the data and provides you with a downloadable report."
// //   },
// //   {
// //     question: "What types of data do I need to provide?",
// //     answer: "Provide data on user activities, services used, performance metrics for the year, etc., in CSV or Excel format."
// //   },
// //   {
// //     question: "Is my data secure?",
// //     answer: "Yes, the system encrypts your data to ensure it's secure during transfer and storage."
// //   },
// //   {
// //     question: "Can I check the status of my report?",
// //     answer: "Yes, navigate to the 'My Reports' section to check the status and download your report once it's ready."
// //   },
// //   {
// //     question: "How can I get technical support?",
// //     answer: "You can either use the chatbot or contact our support team via email or phone."
// //   }
// // ];

// // const support: React.FC = () => {
// //   const [openIndex, setOpenIndex] = useState<number | null>(null);

// //   // Toggle visibility of FAQ answer
// //   const toggleAnswer = (index: number) => {
// //     setOpenIndex(openIndex === index ? null : index);
// //   };

// //   return (
// //     <div className="faq-section">
// //       <h2>Frequently Asked Questions (FAQ)</h2>
// //       {faqs.map((faq, index) => (
// //         <div key={index} className="faq-item">
// //           <h3 onClick={() => toggleAnswer(index)} style={{ cursor: 'pointer' }}>
// //             {faq.question}
// //           </h3>
// //           {openIndex === index && <p>{faq.answer}</p>}
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };

// // export default support;

// import React, { useState } from 'react';

// interface FAQ {
//   question: string;
//   answer: string;
// }

// const faqs: FAQ[] = [
//   {
//     question: "How do I generate the annual report?",
//     answer: "Login to your account, input necessary data, and click 'Generate Report'. The system processes the data and provides you with a downloadable report."
//   },
//   {
//     question: "What types of data do I need to provide?",
//     answer: "Provide data on user activities, services used, performance metrics for the year, etc., in CSV or Excel format."
//   },
//   {
//     question: "Is my data secure?",
//     answer: "Yes, the system encrypts your data to ensure it's secure during transfer and storage."
//   },
//   {
//     question: "Can I check the status of my report?",
//     answer: "Yes, navigate to the 'My Reports' section to check the status and download your report once it's ready."
//   },
//   {
//     question: "How can I get technical support?",
//     answer: "You can either use the chatbot or contact our support team via email or phone."
//   }
// ];

// const Support: React.FC = () => {
//   const [openIndex, setOpenIndex] = useState<number | null>(null);

//   const toggleAnswer = (index: number) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   return (
//     <div className="faq-section">
//       <h2>Frequently Asked Questions (FAQ)</h2>
//       {faqs.map((faq, index) => (
//         <div key={index} className="faq-item">
//           <h3 onClick={() => toggleAnswer(index)} style={{ cursor: 'pointer' }}>
//             {faq.question}
//           </h3>
//           {openIndex === index && <p>{faq.answer}</p>}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Support;


import React, { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "How do I generate the annual report?",
    answer:
      "Login to your account, input necessary data, and click 'Generate Report'. The system processes the data and provides you with a downloadable report.",
  },
  {
    question: "What types of data do I need to provide?",
    answer:
      "Provide data on user activities, services used, performance metrics for the year, etc., in CSV or Excel format.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes, the system encrypts your data to ensure it's secure during transfer and storage.",
  },
  {
    question: "Can I check the status of my report?",
    answer:
      "Yes, navigate to the 'My Reports' section to check the status and download your report once it's ready.",
  },
  {
    question: "How can I get technical support?",
    answer:
      "You can either use the chatbot or contact our support team via email or phone.",
  },
];

const Support: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleAllAnswers = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "auto",
        borderRadius: "10px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#333",
          marginBottom: "20px",
        }}
      >
        Frequently Asked Questions (FAQ)
      </h2>

      <button
        onClick={toggleAllAnswers}
        style={{
          display: "block",
          margin: "10px auto 20px auto",
          padding: "10px 20px",
          fontSize: "16px",
          color: "#fff",
          backgroundColor: isExpanded ? "#007bff" : "#28a745",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "background-color 0.3s",
        }}
      >
        {isExpanded ? "Hide All Answers" : "Show All Answers"}
      </button>

      {faqs.map((faq, index) => (
        <div
          key={index}
          style={{
            marginBottom: "15px",
            padding: "10px",
            borderRadius: "8px",
            backgroundColor: "#fff",
            border: "1px solid #ddd",
          }}
        >
          <h3
            style={{
              margin: 0,
              cursor: "pointer",
              color: "#007bff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={() => setIsExpanded((prev) => !prev)}
          >
            {faq.question}
            <span
              style={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.3s",
              }}
            >
              ▼
            </span>
          </h3>
          {isExpanded && (
            <p
              style={{
                marginTop: "10px",
                color: "#555",
                fontSize: "14px",
                lineHeight: "1.6",
              }}
            >
              {faq.answer}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Support;

