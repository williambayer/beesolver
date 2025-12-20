import { useCallback } from 'react';
import { HoneycombInput } from '@/components/HoneycombInput';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { useSpellingBeeSolver } from '@/hooks/useSpellingBeeSolver';

const Index = () => {
  const {
    letters,
    setLetter,
    setAllLetters,
    resetLetters,
    results,
    groupedResults,
    totalPoints,
    pangramCount,
    hintState,
    revealNextHint,
    revealAll,
    resetHints,
    isComplete,
  } = useSpellingBeeSolver();

  const handleShuffle = useCallback(() => {
    const center = letters[0];
    const outer = letters.slice(1).filter(l => l !== '');
    for (let i = outer.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [outer[i], outer[j]] = [outer[j], outer[i]];
    }
    setAllLetters([center, ...outer, ...Array(6 - outer.length).fill('')]);
  }, [letters, setAllLetters]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container max-w-4xl py-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Spelling Bee Solver</h1>
          <p className="text-muted-foreground mt-1">Find all valid words for today's puzzle</p>
        </div>
      </header>

      <main className="container max-w-4xl py-8">
        <div className="grid md:grid-cols-[auto_1fr] gap-8 items-start">
          {/* Input Section */}
          <div className="flex flex-col items-center gap-6">
            <div className="text-center mb-2">
              <p className="text-sm text-muted-foreground">
                Enter letters • Center = required
              </p>
            </div>
            
            <HoneycombInput
              letters={letters}
              onLetterChange={setLetter}
              onShuffle={handleShuffle}
            />

            <button
              onClick={resetLetters}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>

          {/* Results Section */}
          <div className="min-w-0">
            <ResultsDisplay
              results={results}
              groupedResults={groupedResults}
              totalPoints={totalPoints}
              pangramCount={pangramCount}
              hintState={hintState}
              onRevealNext={revealNextHint}
              onRevealAll={revealAll}
              onReset={resetHints}
              isComplete={isComplete}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
