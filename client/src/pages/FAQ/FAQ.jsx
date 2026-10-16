import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import "../Home/Home.css";

const FAQ_DATA = [
  {
    q: "How large of a document can the AI process at once?",
    a: "QuestAI is optimized to handle large textbooks and corporate manuals exceeding 1,000 pages. Our chunk-based processing pipeline splits documents into digestible parts, extracts logical chapters, and compiles comprehensive assessments without overloading the model.",
  },
  {
    q: "Can the generated quizzes be customized by the user?",
    a: "Absolutely! You can choose specific chapters, select multiple topics, set the difficulty level (Easy, Medium, Hard), choose the quantity of questions, and select preferred formats like MCQs, True/False, or Fill-in-the-blanks.",
  },
  {
    q: "How does the AI grade short answer and long essay questions?",
    a: "Our semantic grading engine analyzes student answers based on conceptual alignment rather than strict word matching. It extracts key terms, compares logic mapping against the reference study material, and provides a grading score alongside helpful feedback.",
  },
  {
    q: "Can I export quizzes to run tests offline?",
    a: "Yes, you can export any generated quiz as a beautifully formatted PDF document (with or without answer sheets) or export results and analytics grades into an Excel worksheet.",
  },
];

export default function FAQ() {
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <div className="home-page" style={{ paddingBottom: "100px" }}>
      {/* Background Decor Gradients */}
      <div className="bg-gradient-orb orb-1"></div>
      <div className="bg-gradient-orb orb-2"></div>
      <div className="bg-gradient-orb orb-3"></div>

      {/* --- FAQ ACCORDION SECTION --- */}
      <section className="faq-section" style={{ padding: "80px 24px" }}>
        <div className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Got questions? We have compiled answers to the most common queries
            about our engine.
          </p>
        </div>

        <div className="faq-list">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className={`faq-card shimmer-card-glow ${isOpen ? "open" : ""}`}>
                <button
                  className="faq-question-btn"
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                >
                  <span>{item.q}</span>
                  <ChevronDown className="faq-chevron" size={20} />
                </button>
                <div className="faq-answer-container">
                  <div className="faq-answer-body">
                    <p>{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
