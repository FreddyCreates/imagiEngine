export function HUD({ health, score, dialogue }: { health: number; score: number; dialogue?: string }) {
  return (
    <>
      <div className="absolute top-4 right-4 text-white p-4 bg-black bg-opacity-50 rounded-xl">
        <div className="text-xl font-bold">Score: {score}</div>
        <div className="text-xl font-bold text-red-500">Health: {health}</div>
      </div>
      {dialogue && (
        <div className="absolute bottom-10 left-10 right-10 text-white p-6 bg-black bg-opacity-80 rounded-2xl text-center text-2xl font-mono border-2 border-purple-500">
          {dialogue}
        </div>
      )}
    </>
  );
}
