import { useMemo } from "react";

const icons: any = {
  CLAP: "👏",
  HEART: "❤️",
  SHOCK: "😱",
  EYE: "👁",
};

export default function Reaction({
  timestamp,
  duration,
  emoji,
}: {
  timestamp: number;
  duration: number;
  emoji: string;
}) {
  const getPosition = () => {
    const percent = timestamp <= duration ? timestamp / duration : 1;
    return `calc(${percent * 100}% - 10px)`;
  };

  const left = useMemo(getPosition, [timestamp, duration]);
  const icon: string = useMemo(() => icons[emoji], [emoji]);

  return (
    <i
      style={{
        left,
        cursor: "pointer",
        display: "block",
        height: "10px",
        width: "10px",
        position: "absolute",
        top: "5px",
      }}
    >
      {icon}
    </i>
  );
}
