import { useTypingContext } from "../context/TypingContext";

const HighlightedText = () => {
  const { _static, userInput } = useTypingContext();
  return (
    <span>
      {_static.split("").map((char, index) => {
        if (index < userInput.length) {
          return (
            <span
              key={index}
              className={
                char === userInput[index] ? "text-green-500" : "text-red-500"
              }
            >
              {char}
            </span>
          );
        }
        return <span key={index}>{char}</span>;
      })}
    </span>
  );
};

export default HighlightedText;
