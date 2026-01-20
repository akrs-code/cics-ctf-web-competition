import { useState, useEffect } from "react";
import axios from "axios";
import QuestionModal from "./QuestionModal";
import { useAuth } from "../hooks/useAuth.js";
import { Search } from "lucide-react";
import { cardClass } from "../src/style.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const QuestionCard = () => {
  const { team } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Fetch questions once
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${BACKEND_URL}/api/questions`);
        const questionsArray = Array.isArray(res.data.questions) ? res.data.questions : [];
        setQuestions(questionsArray);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch questions");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useEffect(() => {
    const handleNewQuestion = (e) => {
      const newQuestion = e.detail;
      setQuestions((prev = []) => {
        if (prev.some(q => q._id === newQuestion._id)) return prev;
        return [newQuestion, ...prev];
      });

    };
    window.addEventListener("new-question", handleNewQuestion);
    return () => window.removeEventListener("new-question", handleNewQuestion);
  }, []);

  const solvedQuestions = Array.isArray(team?.completedQuestions)
    ? team.completedQuestions
    : [];

  if (loading)
    return (
      <div className="flex items-center justify-center p-8 text-[var(--accent-terminal)] font-mono">
        Loading questions...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center p-8 text-red-500 font-mono">
        {error}
      </div>
    );

  if (!questions.length)
    return (
      <div className="flex items-center justify-center p-8 text-[var(--text-muted)] font-mono">
        No questions available
      </div>
    );

  // Categorize questions dynamically
  const categorizedQuestions = questions.reduce((acc, q) => {
    const category = q.category || "General";
    if (!acc[category]) acc[category] = [];
    acc[category].push(q);
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-8 p-4">
        {Object.keys(categorizedQuestions).map((category) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--accent-terminal)]/30 to-transparent" />
              <h2 className="text-3xl font-bold text-[var(--text-primary)] font-roboto tracking-tight">
                {category}
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--accent-terminal)]/30 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categorizedQuestions[category].map((question) => {
                const isSolved =
                  solvedQuestions.includes(question._id) || question.solved;
                return (
                  <div
                    key={question._id}
                    onClick={() => !isSolved && setSelectedQuestion(question)}
                    className={`${cardClass} flex flex-col min-h-[160px] 
                    ${isSolved
                        ? "border-2 border-dashed border-[var(--success)]/50 cursor-not-allowed shadow-[0_0_25px_rgba(31,194,16,0.25)]"
                        : "border-[var(--border-default)] hover:border-[var(--accent-terminal)]/40 cursor-pointer"
                      }`}>

                    <div
                      className={`flex items-center justify-center mb-3 text-3xl font-bold ${isSolved ? "text-green-400" : "text-[var(--accent-terminal)]"
                        }`}>
                      <Search
                        size={28}
                        className="mr-2 text-[var(--accent-terminal)] opacity-80"
                      />

                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <h3
                        className={`text-2xl font-semibold text-center font-inter tracking-tight line-clamp-2 mb-4 ${isSolved
                          ? "text-[var(--success)]"
                          : "text-[var(--text-primary)]"
                          }`}>
                        {question.title}
                      </h3>
                    </div>
                    <div className="flex justify-end mt-auto">
                      <span
                        className={`px-4 py-1.5 rounded-full text-xs font-medium font-jakarta
                            ${isSolved
                            ? "bg-[var(--success)] text-[var(--text-primary)] mt-2"
                            : "bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-terminal)] text-[var(--text-primary)] shadow-[0_0_12px_rgba(31,194,16,0.4)] mt-2"
                          }`}>
                        {isSolved ? "Completed" : `${question.points || 0} points`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div >
      {selectedQuestion && (
        <QuestionModal question={selectedQuestion} onClose={() => setSelectedQuestion(null)} />
      )}
    </>
  );
};

export default QuestionCard;
