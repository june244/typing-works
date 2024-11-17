import TypingTest from "./components/Typing";
import { TypingProvider } from "./context/TypingContext";

export default function Home() {
  return (
    <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 '>
      <main className='flex flex-col gap-8 row-start-2 items-center sm:items-start w-[960px]'>
        <div className='p-3 mb-4 text-3xl m-auto'>
          헤림이 전용 타이핑 연습장!
        </div>
        <TypingProvider>
          <TypingTest />
        </TypingProvider>
      </main>
    </div>
  );
}
