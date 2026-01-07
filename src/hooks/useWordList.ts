import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WORD_LIST } from '@/data/wordList';

const CACHE_KEY = 'spelling-bee-word-list';
const CACHE_TIMESTAMP_KEY = 'spelling-bee-word-list-timestamp';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedWordList {
  words: string[];
  fetchedAt: string;
}

export function useWordList() {
  const [wordList, setWordList] = useState<string[]>(WORD_LIST);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Load cached word list on mount
  useEffect(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (cached && timestamp) {
      try {
        const words = JSON.parse(cached) as string[];
        if (Array.isArray(words) && words.length > 0) {
          setWordList(words);
          setLastUpdated(timestamp);
        }
      } catch (e) {
        console.error('Failed to parse cached word list:', e);
      }
    }
  }, []);

  const updateWordList = useCallback(async (): Promise<{ success: boolean; wordCount?: number; error?: string }> => {
    setIsUpdating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-word-list');
      
      if (error) throw error;
      
      if (data?.success && Array.isArray(data.words)) {
        const words = data.words as string[];
        
        // Cache the words
        localStorage.setItem(CACHE_KEY, JSON.stringify(words));
        localStorage.setItem(CACHE_TIMESTAMP_KEY, data.fetchedAt);
        
        setWordList(words);
        setLastUpdated(data.fetchedAt);
        
        return { success: true, wordCount: words.length };
      }
      
      return { success: false, error: data?.error || 'Unknown error' };
    } catch (err) {
      console.error('Error updating word list:', err);
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to fetch word list' 
      };
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Check if cache is stale and should be refreshed
  const isCacheStale = useCallback(() => {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return true;
    
    const cacheAge = Date.now() - new Date(timestamp).getTime();
    return cacheAge > CACHE_DURATION;
  }, []);

  return {
    wordList,
    isUpdating,
    lastUpdated,
    updateWordList,
    isCacheStale,
    wordCount: wordList.length,
  };
}
