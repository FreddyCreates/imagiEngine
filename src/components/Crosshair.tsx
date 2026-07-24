export function Crosshair() {
  return (
    <div className="absolute top-1/2 left-1/2 w-4 h-4 -ml-2 -mt-2 pointer-events-none">
      <div className="absolute top-1/2 left-0 w-4 h-0.5 bg-white opacity-50" />
      <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-white opacity-50" />
    </div>
  );
}
