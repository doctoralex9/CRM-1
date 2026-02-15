export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        {/* Gear assembly */}
        <div className="relative h-28 w-28">
          {/* Pulse ring behind gears */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" />

          {/* Large gear - spins clockwise */}
          <svg
            className="absolute top-0 left-0 h-20 w-20 text-primary animate-spin-slow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>

          {/* Small gear - spins counter-clockwise, offset */}
          <svg
            className="absolute bottom-0 right-0 h-14 w-14 text-blue-400 animate-spin-reverse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        </div>

        {/* Wave text */}
        <div className="flex items-center gap-[2px] text-lg font-semibold text-primary tracking-wide">
          {"Φόρτωση".split("").map((char, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                animation: `wave 1.2s ease-in-out ${i * 0.08}s infinite`,
              }}
            >
              {char}
            </span>
          ))}
          {/* Animated dots */}
          {[0, 1, 2].map((i) => (
            <span
              key={`dot-${i}`}
              className="inline-block"
              style={{
                animation: `wave 1.2s ease-in-out ${(7 + i) * 0.08}s infinite`,
              }}
            >
              .
            </span>
          ))}
        </div>

        {/* Shimmer bar */}
        <div className="h-1 w-48 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-full animate-shimmer rounded-full" />
        </div>
      </div>
    </div>
  );
}
