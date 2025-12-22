import { useCallback, useState } from 'react';
import { HoneycombInput } from '@/components/HoneycombInput';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { useSpellingBeeSolver } from '@/hooks/useSpellingBeeSolver';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index = () => {
  const [isFetching, setIsFetching] = useState(false);
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

  const handleFetchToday = useCallback(async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-spelling-bee');
      
      if (error) throw error;
      
      if (data?.success) {
        const allLetters = [data.centerLetter, ...data.outerLetters];
        setAllLetters(allLetters);
        toast.success(`Loaded puzzle for ${data.date}`);
      } else {
        toast.error(data?.error || 'Could not fetch puzzle', {
          description: data?.hint || 'Try entering letters manually'
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error('Failed to fetch today\'s puzzle', {
        description: 'NYT may require login. Enter letters manually.'
      });
    } finally {
      setIsFetching(false);
    }
  }, [setAllLetters]);

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

            <div className="flex gap-3">
              <button
                onClick={handleFetchToday}
                disabled={isFetching}
                className="px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isFetching ? 'Fetching...' : "Today's Puzzle"}
              </button>
              <button
                onClick={resetLetters}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>
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
