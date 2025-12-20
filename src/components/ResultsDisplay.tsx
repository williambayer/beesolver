import { cn } from '@/lib/utils';
import type { GroupedResults, HintState, SolverResult } from '@/hooks/useSpellingBeeSolver';

interface ResultsDisplayProps {
  results: SolverResult[];
  groupedResults: GroupedResults;
  totalPoints: number;
  pangramCount: number;
  hintState: HintState;
  onRevealNext: () => void;
  onRevealAll: () => void;
  onReset: () => void;
  isComplete: boolean;
}

export function ResultsDisplay({
  results,
  groupedResults,
  totalPoints,
  pangramCount,
  hintState,
  onRevealNext,
  onRevealAll,
  onReset,
  isComplete,
}: ResultsDisplayProps) {
  if (!isComplete) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg">Enter all 7 letters to find words</p>
        <p className="text-sm mt-2">Center letter is required in every word</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p className="text-lg">No words found with these letters</p>
      </div>
    );
  }

  const lengths = Object.keys(groupedResults).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6">
      {/* Summary */}
      {hintState.showTotalCount && (
        <div className="animate-reveal text-center p-4 bg-card rounded-lg border border-border">
          <p className="text-2xl font-bold">{results.length} words</p>
          <p className="text-muted-foreground">
            {totalPoints} total points • {pangramCount} pangram{pangramCount !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Hint Controls */}
      <div className="flex gap-2 justify-center flex-wrap">
        {!hintState.showAllWords && (
          <button
            onClick={onRevealNext}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Reveal Next Hint
          </button>
        )}
        {!hintState.showAllWords && (
          <button
            onClick={onRevealAll}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Show All Words
          </button>
        )}
        {hintState.showTotalCount && (
          <button
            onClick={onReset}
            className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-colors"
          >
            Hide Hints
          </button>
        )}
      </div>

      {/* Words by Length */}
      {hintState.showLengthCounts && (
        <div className="space-y-4">
          {lengths.map((length) => (
            <div key={length} className="animate-reveal">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                {length}-letter words
                <span className="text-sm font-normal text-muted-foreground">
                  ({groupedResults[length].length})
                </span>
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {groupedResults[length].map((result, idx) => (
                  <WordCard
                    key={result.word}
                    result={result}
                    hintState={hintState}
                    index={idx}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WordCard({ result, hintState, index }: { result: SolverResult; hintState: HintState; index: number }) {
  const showWord = hintState.showAllWords;
  const showFirstLetter = hintState.showFirstLetters;

  return (
    <div
      className={cn(
        "px-3 py-1.5 rounded-lg font-medium transition-all",
        result.isPangram
          ? "bg-pangram text-pangram-foreground"
          : "bg-secondary text-secondary-foreground",
        showWord && "animate-reveal"
      )}
      style={{ animationDelay: showWord ? `${index * 20}ms` : undefined }}
    >
      {showWord ? (
        <span className={result.isPangram ? "font-bold" : ""}>
          {result.word}
          {result.isPangram && " ⭐"}
        </span>
      ) : showFirstLetter ? (
        <span className="text-muted-foreground">
          {result.word[0].toUpperCase()}{"•".repeat(result.word.length - 1)}
        </span>
      ) : (
        <span className="text-hint-hidden">{"•".repeat(result.word.length)}</span>
      )}
    </div>
  );
}
