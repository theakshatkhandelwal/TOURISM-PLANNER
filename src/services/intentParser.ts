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
    // Pattern 1: "going to [Place]" or "going to go to [Place]"
    let match = input.match(/going\s+to\s+(?:go\s+to\s+)?([A-Z][a-zA-Z\s]+?)(?:\s*[,\.\?]|\s+let|$)/i);
    if (match && match[1]) {
      let place = match[1].trim();
      place = place.replace(/[,\.\?]+$/, '').trim();
      // Remove common trailing words
      place = place.replace(/\s+(what|let|plan|my|trip|and|are|can|visit|go|is|the|there|temperature|places).*$/i, '').trim();
      if (place.length > 2) {
        return place;
      }
    }
    
    // Pattern 2: "I'm going to [Place]" or "I am going to [Place]"
    match = input.match(/(?:I'?m|I\s+am)\s+going\s+to\s+(?:go\s+to\s+)?([A-Z][a-zA-Z\s]+?)(?:\s*[,\.\?]|\s+let|\s+what|$)/i);
    if (match && match[1]) {
      let place = match[1].trim();
      place = place.replace(/[,\.\?]+$/, '').trim();
      place = place.replace(/\s+(what|let|plan|my|trip|and|are|can|visit|go|is|the|there|temperature|places).*$/i, '').trim();
      if (place.length > 2) {
        return place;
      }
    }
    
    // Pattern 3: "in [Place]" or "at [Place]"
    match = input.match(/(?:in|at)\s+([A-Z][a-zA-Z\s]+?)(?:\s*[,\.\?]|\s+it|$)/i);
    if (match && match[1]) {
      let place = match[1].trim();
      place = place.replace(/[,\.\?]+$/, '').trim();
      if (place.length > 2) {
        return place;
      }
    }
    
    // Pattern 4: Find capitalized words (place names are usually capitalized)
    const words = input.split(/\s+/);
    const capitalizedWords: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[,\.\?;:!]+$/, '');
      // Skip common words that might be capitalized
      if (['I', 'I\'m', 'I\'ve', 'Let', 'Let\'s', 'What', 'The', 'And', 'Are', 'Can', 'Is', 'There', 'My', 'Trip', 'Plan'].includes(word)) {
        continue;
      }
      if (word.length > 2 && /^[A-Z][a-z]+$/.test(word)) {
        capitalizedWords.push(word);
        // Check if next word is also capitalized (multi-word place names like "New York")
        if (i + 1 < words.length) {
          const nextWord = words[i + 1].replace(/[,\.\?;:!]+$/, '');
          if (/^[A-Z][a-z]+$/.test(nextWord) && !['What', 'Let', 'Plan', 'My', 'Trip', 'And', 'Are', 'Can', 'Is', 'The', 'There'].includes(nextWord)) {
            capitalizedWords.push(nextWord);
            i++;
          }
        }
        break;
      }
    }
    
    if (capitalizedWords.length > 0) {
      return capitalizedWords.join(' ');
    }
    
    // Last resort: return first capitalized word that's not a common word
    const commonWords = ['I', 'I\'m', 'I\'ve', 'Let', 'Let\'s', 'What', 'The', 'And', 'Are', 'Can', 'Is', 'There', 'My', 'Trip', 'Plan', 'Going', 'To', 'Go'];
    const firstCap = words.find(w => {
      const clean = w.replace(/[,\.\?;:!]+$/, '');
      return /^[A-Z]/.test(clean) && !commonWords.includes(clean);
    });
    return firstCap ? firstCap.replace(/[,\.\?;:!]+$/, '') : '';
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

