export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/*SVG animation */}
        <img src="/loading.svg" alt='Loading...'/>
      </div>
    </div>
  );
}
