import { useState, useEffect, useMemo } from "react";
import QuestionCard from "../components/QuestionCard";

const Home = () => {
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const numColumns = 30;
    const newColumns = [];

    for (let i = 0; i < numColumns; i++) {
      const column = [];
      const columnLength = Math.floor(Math.random() * 30) + 20;
      const columnDelay = Math.random() * 5;

      for (let j = 0; j < columnLength; j++) {
        column.push({
          char: chars[Math.floor(Math.random() * chars.length)],
          delay: columnDelay + j * 0.1,
          duration: 2 + Math.random() * 3,
          opacity: j === 0 ? 1 : Math.max(0.3, 1 - j * 0.05),
        });
      }

      newColumns.push({ left: `${(100 / numColumns) * i}%`, items: column });
    }

    setColumns(newColumns);
  }, []); 

  const matrixColumns = useMemo(() => columns, [columns]);

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden">
      {/* Technology-themed background */}
      <div className="absolute inset-0 -z-10 bg-[#041212]">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 [background:radial-gradient(ellipse_100%_100%_at_0%_0%,rgba(31,194,16,0.15),transparent_70%),radial-gradient(ellipse_100%_100%_at_100%_0%,rgba(5,142,63,0.12),transparent_70%),radial-gradient(ellipse_80%_80%_at_50%_50%,rgba(31,194,16,0.1),transparent_80%),radial-gradient(ellipse_100%_100%_at_0%_100%,rgba(143,163,160,0.06),transparent_70%),radial-gradient(ellipse_100%_100%_at_100%_100%,rgba(5,142,63,0.1),transparent_70%),linear-gradient(135deg,#041212_0%,#051111_30%,#041212_60%,#000000_100%)]"></div>
        <div className="absolute inset-0 [background:linear-gradient(to_right,rgba(31,194,16,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(31,194,16,0.06)_1px,transparent_1px)] [background-size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]"></div>
        <div className="absolute inset-0 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(31,194,16,0.02)_2px,rgba(31,194,16,0.02)_4px),repeating-linear-gradient(90deg,transparent,transparent_2px,rgba(5,142,63,0.02)_2px,rgba(5,142,63,0.02)_4px)] [background-size:20px_20px]"></div>
      </div>

      <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
        {matrixColumns.map((column, colIndex) => (
          <div key={colIndex} className="absolute top-0" style={{ left: column.left }}>
            {column.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="absolute text-[#1FC210] text-sm font-mono whitespace-nowrap"
                style={{
                  animation: `fall ${item.duration}s linear infinite`,
                  animationDelay: `${item.delay}s`,
                  left: 0,
                  top: "-200px",
                  opacity: item.opacity,
                  textShadow: "0 0 5px rgba(31,194,16,0.5), 0 0 10px rgba(31,194,16,0.3)",
                }}
              >
                {item.char}
              </div>
            ))}
          </div>
        ))}
      </div>

  
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-200px); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 0.3; }
          100% { transform: translateY(calc(100vh + 200px)); opacity: 0; }
        }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 px-24 mx-auto py-24">
        <QuestionCard />
      </div>
    </div>
  );
};

export default Home;
