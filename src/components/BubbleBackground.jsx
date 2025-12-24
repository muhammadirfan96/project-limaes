import "../bubble.css";

const directionMap = {
  "left-to-right": { x: 120, y: 0 },
  "right-to-left": { x: -120, y: 0 },
  "top-to-bottom": { x: 0, y: 120 },
  "bottom-to-top": { x: 0, y: -120 },
};

const BubbleBackground = ({ count = 20, direction = "left-to-right" }) => {
  const move = directionMap[direction];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const size = Math.random() * 40 + 20;
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const duration = Math.random() * 15 + 10;
        const delay = Math.random() * 8;
        const opacity = Math.random() * 0.25 + 0.1;

        return (
          <span
            key={i}
            className="bubble"
            style={{
              width: size,
              height: size,
              top: `${top}%`,
              left: `${left}%`,
              opacity,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              "--move-x": `${move.x}vw`,
              "--move-y": `${move.y}vh`,
            }}
          />
        );
      })}
    </div>
  );
};

export default BubbleBackground;
