const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching NYT Spelling Bee puzzle...');
    
    // Try to fetch from NYT Spelling Bee page
    const nytUrl = 'https://www.nytimes.com/puzzles/spelling-bee';
    
    const response = await fetch(nytUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch NYT page:', response.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not access NYT Spelling Bee page',
          hint: 'The NYT may be blocking automated requests or require a subscription'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await response.text();
    console.log('Received HTML, length:', html.length);

    // Try to extract gameData from the page
    // NYT embeds puzzle data in a script tag as window.gameData
    const gameDataMatch = html.match(/window\.gameData\s*=\s*({[\s\S]*?});?\s*<\/script>/);
    
    if (gameDataMatch) {
      try {
        const gameData = JSON.parse(gameDataMatch[1]);
        console.log('Found gameData');
        
        // Extract today's puzzle
        const today = gameData.today;
        if (today && today.centerLetter && today.outerLetters) {
          const centerLetter = today.centerLetter.toUpperCase();
          const outerLetters = today.outerLetters.map((l: string) => l.toUpperCase());
          
          console.log('Found puzzle - center:', centerLetter, 'outer:', outerLetters);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              centerLetter,
              outerLetters,
              date: today.printDate || new Date().toISOString().split('T')[0]
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (parseError) {
        console.error('Failed to parse gameData:', parseError);
      }
    }

    // Alternative: try to find letters in SVG hive cells
    // Pattern: <text class="cell-letter">A</text>
    const letterMatches = html.matchAll(/class="cell-letter[^"]*"[^>]*>([A-Za-z])</g);
    const letters: string[] = [];
    for (const match of letterMatches) {
      letters.push(match[1].toUpperCase());
    }

    if (letters.length >= 7) {
      // First letter is typically the center
      console.log('Found letters via SVG:', letters);
      return new Response(
        JSON.stringify({ 
          success: true, 
          centerLetter: letters[0],
          outerLetters: letters.slice(1, 7),
          date: new Date().toISOString().split('T')[0],
          method: 'svg-extraction'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If we couldn't extract letters, return a helpful error
    console.log('Could not extract puzzle letters from page');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Could not extract puzzle letters from NYT page',
        hint: 'The NYT page structure may have changed or requires JavaScript rendering. Try entering letters manually.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching puzzle:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
