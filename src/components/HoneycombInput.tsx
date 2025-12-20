import { cn } from '@/lib/utils';

interface HoneycombInputProps {
  letters: string[];
  onLetterChange: (index: number, letter: string) => void;
  onShuffle: () => void;
}

export function HoneycombInput({ letters, onLetterChange, onShuffle }: HoneycombInputProps) {
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && letters[index] === '' && index > 0) {
      const prevInput = document.querySelector(`[data-index="${index - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleChange = (index: number, value: string) => {
    const letter = value.slice(-1).toUpperCase().replace(/[^A-Z]/g, '');
    onLetterChange(index, letter);
    if (letter && index < 6) {
      const nextInput = document.querySelector(`[data-index="${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-64 h-72">
        {/* Center cell */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <input
            data-index={0}
            type="text"
            maxLength={1}
            value={letters[0]}
            onChange={(e) => handleChange(0, e.target.value)}
            onKeyDown={(e) => handleKeyDown(0, e)}
            className={cn(
              "honeycomb-cell w-20 h-24 text-center text-3xl font-bold uppercase",
              "bg-honeycomb-center text-primary-foreground",
              "border-none outline-none focus:ring-2 focus:ring-ring",
              "transition-transform hover:scale-105"
            )}
            placeholder="•"
          />
        </div>
        {/* Surrounding cells - positioned around center */}
        {[1, 2, 3, 4, 5, 6].map((i) => {
          const angle = ((i - 1) * 60 - 90) * (Math.PI / 180);
          const radius = 70;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
            >
              <input
                data-index={i}
                type="text"
                maxLength={1}
                value={letters[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={cn(
                  "honeycomb-cell w-20 h-24 text-center text-3xl font-bold uppercase",
                  "bg-honeycomb-outer text-foreground",
                  "border-none outline-none focus:ring-2 focus:ring-ring",
                  "transition-transform hover:scale-105 hover:bg-honeycomb-hover"
                )}
                placeholder="•"
              />
            </div>
          );
        })}
      </div>
      <button
        onClick={onShuffle}
        className="px-4 py-2 text-sm font-medium rounded-full border border-border hover:bg-secondary transition-colors"
      >
        ↻ Shuffle
      </button>
    </div>
  );
}
