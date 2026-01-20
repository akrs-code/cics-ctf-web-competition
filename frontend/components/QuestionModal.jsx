import { useState, useEffect } from "react";
import axios from "axios";
import { HardDriveDownload } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { io } from "socket.io-client";
import { buttonClass, cardClass, inputClass, attachmentClass } from "../src/style.js";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const QuestionModal = ({ question, onClose }) => {
  const [flag, setFlag] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const { user, team, setTeam } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const storedTeam = JSON.parse(localStorage.getItem("team"));
    if (!storedTeam) return;

    const s = io(`${BACKEND_URL}`, { auth: { token: user?.token } });
    setSocket(s);

    return () => s.disconnect();
  }, [user]);

  const handleSubmit = async () => {
    if (!flag.trim() || !user || !team) {
      setMessage("You must enter an answer");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post(
        `${BACKEND_URL}/api/submissions/submit`,
        {
          userId: user._id,
          teamId: team._id,
          questionId: question._id,
          submittedFlag: flag,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage(res.data.message || "Submission received!");
      setSuccess(res.data.pointsEarned > 0);

      if (res.data.pointsEarned > 0) {
        const updatedTeam = {
          ...team,
          completedQuestions: [
            ...(team.completedQuestions || []),
            question._id,
          ],
          score: (team.score || 0) + res.data.pointsEarned,
        };

        setTeam(updatedTeam);
        localStorage.setItem("team", JSON.stringify(updatedTeam));

        socket?.emit("newSubmission", {
          userId: user._id,
          teamId: team._id,
          questionId: question._id,
          pointsEarned: res.data.pointsEarned,
          correct: true,
        });

        setTimeout(onClose, 1200);
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && !loading && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cardClass}>
        {/* Title + points */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl text-[var(--text-primary)] font-bold font-roboto">
            {question.title}
          </h1>
          <span className="px-4 py-1.5 rounded-full text-sm font-medium font-jakarta bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-terminal)] text-[var(--text-primary)] shadow-[0_0_12px_rgba(31,194,16,0.4)]">
            {question.points} points
          </span>
        </div>

        <p className="text-[var(--text-muted)] font-mono leading-relaxed mb-6 whitespace-pre-line">
          {question.description}
        </p>

        {question.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {question.attachments.map((file, idx) => (
              <a
                key={idx}
                href={`/${file}`}
                download
                className={attachmentClass}
              >
                <HardDriveDownload size={16} />
                {file.split("/").pop()}
              </a>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          <input
            type="text"
            id="flag"
            name="flag"
            placeholder="picoCTF{...}"
            value={flag}
            disabled={loading || success}
            onChange={(e) => setFlag(e.target.value)}
            className={`${inputClass} flex-1`}
          />
          <button
            onClick={handleSubmit}
            disabled={loading || success}
            className={buttonClass}>
            {loading ? "Checking..." : "Submit Flag"}
          </button>
        </div>

        {message && (
          <p className={`mt-4 font-mono text-sm text-center ${success ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    </div >
  );
};

export default QuestionModal;
