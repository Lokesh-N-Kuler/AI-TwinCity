import { useState } from "react";

import AIHeader from "../components/AIHeader";
import AIStatusSummary from "../components/AIStatusSummary";
import SuggestedQuestions from "../components/SuggestedQuestions";
import ChatBox from "../components/ChatBox";

import "../styles/aiassistant.css";

function AIAssistant() {
  const [selectedQuestion, setSelectedQuestion] = useState("");

  return (
    <section id="ai-assistant" className="ai-assistant-page">
      <AIHeader />

      <AIStatusSummary />

      <div className="ai-main-section">
        <SuggestedQuestions
          onQuestionSelect={setSelectedQuestion}
        />

        <ChatBox
          selectedQuestion={selectedQuestion}
          onQuestionUsed={() => setSelectedQuestion("")}
        />
      </div>
    </section>
  );
}

export default AIAssistant;
