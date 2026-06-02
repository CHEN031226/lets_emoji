import { useState, useEffect, useMemo } from 'react';
import { pinyin } from 'pinyin-pro';

export interface EmojiData {
  unicode: string;
  label: string;
  tags?: string[];
}

export function useEmojiData() {
  const [emojis, setEmojis] = useState<EmojiData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const urls = [
        'https://cdn.jsdelivr.net/npm/emojibase-data@latest/zh/compact.json',
        'https://unpkg.com/emojibase-data@latest/zh/compact.json'
      ];

      for (const url of urls) {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          setEmojis(data);
          setLoading(false);
          return;
        } catch (error) {
          console.warn(`Failed to fetch from ${url}:`, error);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return { emojis, loading };
}

export function useEmojiMatcher(inputText: string, emojis: EmojiData[]) {
  return useMemo(() => {
    if (!inputText || !emojis || emojis.length === 0) return [];

    const normalizedInput = String(inputText).trim();
    if (!normalizedInput) return [];

    try {
      // 1. Aggressive partial match for the whole input
      const fullMatch = emojis.filter(e => {
        if (!e) return false;
        const labelPartial = typeof e.label === 'string' && e.label.includes(normalizedInput);
        const tagPartial = Array.isArray(e.tags) && e.tags.some(tag => typeof tag === 'string' && tag.includes(normalizedInput));
        return labelPartial || tagPartial;
      }).slice(0, 50);

      if (fullMatch.length > 0) {
        return [{
          char: normalizedInput,
          matches: fullMatch
        }];
      }

      // 2. Fallback: Character by character with Pinyin/Homophone support
      const segments = Array.from(normalizedInput);
      
      return segments.map(seg => {
        if (!seg) return { char: '', matches: null };

        // 2a. Direct match
        let matches = emojis.filter(e => {
          if (!e || typeof e.label !== 'string') return false;
          const labelMatch = e.label.includes(seg);
          const tagMatch = Array.isArray(e.tags) && e.tags.some(tag => typeof tag === 'string' && tag.includes(seg));
          return labelMatch || tagMatch;
        });

        // 2b. Homophone match if no direct match found
        if (matches.length === 0) {
          const py = pinyin(seg, { toneType: 'none', type: 'array' })[0];
          if (py) {
            // Find emojis whose label or tags have similar pinyin or meaning related to the sound
            // This is tricky without a full pinyin-to-emoji map, but we can try to see if 
            // any other common characters with the SAME pinyin have emojis.
            
            // For now, let's use a simple approach: if "锣" (luo) has no emoji,
            // we search for other things that sound like "luo".
            // Since our dataset is Chinese-labeled, we'd need to know which Chinese words 
            // sound like "luo" and HAVE emojis.
            
            // A better way: The Emojibase data doesn't have pinyin. 
            // But we can try to search for the pinyin itself in tags (some emojis have English tags)
            matches = emojis.filter(e => {
              if (!e) return false;
              const labelPy = pinyin(e.label, { toneType: 'none' });
              return labelPy.includes(py);
            }).slice(0, 10);
          }
        }

        return {
          char: seg,
          matches: matches.length > 0 ? matches.slice(0, 20) : null
        };
      }).filter(item => item.char && item.char.trim() !== '');
    } catch (err) {
      console.error('Error in useEmojiMatcher:', err);
      return [];
    }
  }, [inputText, emojis]);
}
