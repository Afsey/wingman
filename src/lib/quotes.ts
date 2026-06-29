export interface Quote {
  text: string;
  author: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Do not wait; the time will never be 'just right.' Start where you stand.", author: "Napoleon Hill" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "Limit your 'always' and your 'nevers.'", author: "Amy Poehler" },
  { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
  { text: "Whether you think you can or think you can't, you're right.", author: "Henry Ford" },
  { text: "Out of difficulties grow miracles.", author: "Jean de la Bruyere" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "Keep your eyes on the stars, and your feet on the ground.", author: "Theodore Roosevelt" },
  { text: "Write it on your heart that every day is the best day in the year.", author: "Ralph Waldo Emerson" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Hardships often prepare ordinary people for an extraordinary destiny.", author: "C.S. Lewis" },
  { text: "Build your own dreams, or someone else will hire you to build theirs.", author: "Farrah Gray" },
  { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
  { text: "Be himself, and not someone else.", author: "Michel de Montaigne" },
  { text: "If you want to live a happy life, tie it to a goal, not to people or things.", author: "Albert Einstein" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" }
];

export function getQuoteForTime(): Quote {
  if (typeof window === 'undefined') {
    return MOTIVATIONAL_QUOTES[0];
  }
  
  // Use epoch time to create a 14-day cycle
  const epochDays = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const dayIndex = epochDays % 14;
  
  // Make sure we have enough quotes in the array
  const safeIndex = dayIndex % MOTIVATIONAL_QUOTES.length;
  
  return MOTIVATIONAL_QUOTES[safeIndex];
}
