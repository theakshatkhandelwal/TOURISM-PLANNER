import { QueryType } from '../types';

export interface ParsedIntent {
  place: string;
  queryType: QueryType;
}

export class IntentParser {
  /**
   * Parse natural language input to extract place and intent
   */
  parseInput(input: string): ParsedIntent {
    const normalized = input.toLowerCase().trim();
    
    // Extract place name - look for patterns like "going to [place]" or "in [place]"
    let place = this.extractPlaceName(input, normalized);
    
    // Determine intent based on keywords
    const hasWeatherKeywords = this.hasWeatherKeywords(normalized);
    const hasPlacesKeywords = this.hasPlacesKeywords(normalized);
    
    let queryType: QueryType = 'all';
    
    if (hasWeatherKeywords && !hasPlacesKeywords) {
      queryType = 'weather';
    } else if (hasPlacesKeywords && !hasWeatherKeywords) {
      queryType = 'places';
    } else if (hasWeatherKeywords && hasPlacesKeywords) {
      queryType = 'all';
    } else {
      // Default: if no specific intent, assume places (for "plan my trip" type queries)
      queryType = 'places';
    }
    
    return {
      place: place.trim(),
      queryType,
    };
  }
  
  private extractPlaceName(input: string, normalized: string): string {
    // Common words to ignore (case-insensitive)
    const ignoreWords = new Set([
      'i', 'i\'m', 'i\'ve', 'let', 'let\'s', 'what', 'the', 'and', 'are', 'can', 'is', 'there', 
      'my', 'trip', 'plan', 'going', 'to', 'go', 'temperature', 'temp', 'weather', 'weather\'s',
      'of', 'in', 'at', 'for', 'from', 'with', 'will', 'want', 'need', 'show', 'tell', 'give',
      'get', 'find', 'see', 'visit', 'travel'
    ]);
    
    // Helper function to capitalize first letter
    const capitalize = (str: string): string => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };
    
    // Pattern 1: "[Something] of [Place]" - e.g., "Temperature of Kolkata" or "temperature of kolkata"
    let match = input.match(/\b(\w+)\s+of\s+([a-zA-Z\s]+?)(?:\s*[,\.\?]|$)/i);
    if (match && match[2]) {
      let place = match[2].trim();
      place = place.replace(/[,\.\?]+$/, '').trim();
      // Remove trailing common words
      place = place.replace(/\s+(what|let|plan|my|trip|and|are|can|visit|go|is|the|there|temperature|places).*$/i, '').trim();
      if (place.length > 2) {
        // Capitalize first letter of each word
        return place.split(' ').map(w => capitalize(w)).join(' ');
      }
    }
    
    // Pattern 2: "going to [Place]" or "going to go to [Place]" (case-insensitive)
    match = input.match(/going\s+to\s+(?:go\s+to\s+)?([a-zA-Z\s]+?)(?:\s*[,\.\?]|\s+let|$)/i);
    if (match && match[1]) {
      let place = match[1].trim();
      place = place.replace(/[,\.\?]+$/, '').trim();
      place = place.replace(/\s+(what|let|plan|my|trip|and|are|can|visit|go|is|the|there|temperature|places).*$/i, '').trim();
      const firstWord = place.split(' ')[0].toLowerCase();
      if (place.length > 2 && !ignoreWords.has(firstWord)) {
        return place.split(' ').map(w => capitalize(w)).join(' ');
      }
    }
    
    // Pattern 3: "I'm going to [Place]" or "I am going to [Place]" (case-insensitive)
    match = input.match(/(?:I'?m|I\s+am|i'?m|i\s+am)\s+going\s+to\s+(?:go\s+to\s+)?([a-zA-Z\s]+?)(?:\s*[,\.\?]|\s+let|\s+what|$)/i);
    if (match && match[1]) {
      let place = match[1].trim();
      place = place.replace(/[,\.\?]+$/, '').trim();
      place = place.replace(/\s+(what|let|plan|my|trip|and|are|can|visit|go|is|the|there|temperature|places).*$/i, '').trim();
      const firstWord = place.split(' ')[0].toLowerCase();
      if (place.length > 2 && !ignoreWords.has(firstWord)) {
        return place.split(' ').map(w => capitalize(w)).join(' ');
      }
    }
    
    // Pattern 4: "in [Place]" or "at [Place]" (case-insensitive)
    match = input.match(/(?:in|at)\s+([a-zA-Z\s]+?)(?:\s*[,\.\?]|\s+it|$)/i);
    if (match && match[1]) {
      let place = match[1].trim();
      place = place.replace(/[,\.\?]+$/, '').trim();
      const firstWord = place.split(' ')[0].toLowerCase();
      if (place.length > 2 && !ignoreWords.has(firstWord)) {
        return place.split(' ').map(w => capitalize(w)).join(' ');
      }
    }
    
    // Pattern 5: Find words that look like place names (case-insensitive)
    // First try capitalized words, then try any word that's not a common word
    const words = input.split(/\s+/);
    const placeWords: string[] = [];
    
    // First pass: look for capitalized words
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[,\.\?;:!]+$/, '');
      const wordLower = word.toLowerCase();
      
      // Skip common words
      if (ignoreWords.has(wordLower)) {
        continue;
      }
      
      // Look for capitalized words
      if (word.length > 2 && /^[A-Z][a-z]+$/.test(word)) {
        placeWords.push(word);
        // Check if next word is also capitalized (multi-word place names like "New York")
        if (i + 1 < words.length) {
          const nextWord = words[i + 1].replace(/[,\.\?;:!]+$/, '');
          const nextWordLower = nextWord.toLowerCase();
          if (/^[A-Z][a-z]+$/.test(nextWord) && !ignoreWords.has(nextWordLower)) {
            placeWords.push(nextWord);
            i++;
          }
        }
        break;
      }
    }
    
    // Second pass: if no capitalized words found, look for any word that's not common
    if (placeWords.length === 0) {
      for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[,\.\?;:!]+$/, '');
        const wordLower = word.toLowerCase();
        
        // Skip common words and very short words
        if (ignoreWords.has(wordLower) || word.length < 3) {
          continue;
        }
        
        // Take the first word that looks like a place name
        // (usually a proper noun or a word that's not a common English word)
        if (/^[a-zA-Z]+$/.test(word) && word.length >= 3) {
          placeWords.push(word);
          break;
        }
      }
    }
    
    if (placeWords.length > 0) {
      // Capitalize first letter of each word
      return placeWords.map(w => capitalize(w)).join(' ');
    }
    
    // Last resort: return first word that's not a common word (case-insensitive)
    for (const w of words) {
      const clean = w.replace(/[,\.\?;:!]+$/, '');
      const cleanLower = clean.toLowerCase();
      if (clean.length >= 3 && /^[a-zA-Z]+$/.test(clean) && !ignoreWords.has(cleanLower)) {
        return capitalize(clean);
      }
    }
    
    return '';
  }
  
  private hasWeatherKeywords(text: string): boolean {
    const weatherKeywords = [
      'temperature',
      'temp',
      'weather',
      'rain',
      'raining',
      'precipitation',
      'forecast',
      'climate',
      'hot',
      'cold',
      'degrees',
      'celsius',
      'fahrenheit',
      'what is the temperature',
      'how is the weather',
    ];
    
    return weatherKeywords.some(keyword => text.includes(keyword));
  }
  
  private hasPlacesKeywords(text: string): boolean {
    const placesKeywords = [
      'places',
      'attractions',
      'visit',
      'see',
      'tourist',
      'sightseeing',
      'plan my trip',
      'plan trip',
      "let's plan",
      'where to go',
      'what to see',
      'what to visit',
      'can visit',
      'can go',
    ];
    
    return placesKeywords.some(keyword => text.includes(keyword));
  }
}

