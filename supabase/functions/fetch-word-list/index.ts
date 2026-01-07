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
    console.log('Fetching word list from GitHub archive...');
    
    // Fetch the markdown file from the spelling-bee-answers repository
    const response = await fetch(
      'https://raw.githubusercontent.com/tedmiston/spelling-bee-answers/master/outputs/Words.md'
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch word list: ${response.status}`);
    }

    const markdown = await response.text();
    console.log(`Fetched ${markdown.length} bytes of markdown`);

    // Parse the markdown table to extract words
    // Format: | **word** | count | dates... |
    const wordRegex = /\|\s*\*\*([a-z]+)\*\*/gi;
    const words: string[] = [];
    let match;

    while ((match = wordRegex.exec(markdown)) !== null) {
      const word = match[1].toLowerCase();
      // Only include words with 4+ letters (Spelling Bee requirement)
      if (word.length >= 4) {
        words.push(word);
      }
    }

    // Remove duplicates and sort
    const uniqueWords = [...new Set(words)].sort();
    
    console.log(`Extracted ${uniqueWords.length} unique words`);

    return new Response(
      JSON.stringify({
        success: true,
        wordCount: uniqueWords.length,
        words: uniqueWords,
        fetchedAt: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fetching word list:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch word list'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
