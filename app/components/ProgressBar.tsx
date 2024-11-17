export default function ProgressBar({
  value = 90,
  max = 100,
}: {
  value?: number;
  max?: number;
}) {
  const segments = 20;
  const filledSegments = Math.floor((value / max) * segments);

  return (
    <div className='w-full'>
      <div
        className='
          flex 
          h-8
          w-full
          rounded-full 
          p-1
          bg-gradient-to-r 
          from-cyan-400 
          to-cyan-800
          overflow-hidden
          '
      >
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className={`
                flex-1 
                ${i < filledSegments ? "bg-transparent" : "bg-black"}
                transition-colors
                duration-300
                ease-in-out
                transform 
                ${!(i === 0 || i === segments - 1) && "skew-x-[20deg] "}
                -ml-1
                first:ml-0
                ${i === 0 ? "rounded-l-full" : ""}
                ${i === segments - 1 ? "rounded-r-full" : ""}
              `}
          />
        ))}
      </div>
    </div>
  );
}
