export const EXPENSE_CATEGORIES = {
  food:          { name: 'Food',          emoji: '🍔', keywords: ['food', 'eat', 'restaurant', 'cafe', 'lunch', 'dinner', 'breakfast'] },
  transport:     { name: 'Transport',     emoji: '🚕', keywords: ['taxi', 'transport', 'bus', 'metro', 'fuel', 'gas'] },
  shopping:      { name: 'Shopping',      emoji: '🛍️', keywords: ['shop', 'store', 'buy', 'purchase', 'clothes'] },
  entertainment: { name: 'Entertainment', emoji: '🎮', keywords: ['fun', 'game', 'movie', 'cinema', 'music'] },
  bills:         { name: 'Bills',         emoji: '📄', keywords: ['bill', 'electricity', 'water', 'internet', 'phone', 'rent'] },
  health:        { name: 'Health',        emoji: '🏥', keywords: ['health', 'doctor', 'medicine', 'hospital'] },
  education:     { name: 'Education',     emoji: '📚', keywords: ['education', 'school', 'course', 'book'] },
  travel:        { name: 'Travel',        emoji: '✈️', keywords: ['travel', 'flight', 'hotel', 'vacation'] },
  gifts:         { name: 'Gifts',         emoji: '🎁', keywords: ['gift', 'present', 'charity'] },
  other:         { name: 'Other',         emoji: '📦', keywords: ['other', 'misc'] },
};

export const INCOME_CATEGORIES = {
  salary:    { name: 'Salary',    emoji: '💰', keywords: ['salary', 'wage', 'pay'] },
  freelance: { name: 'Freelance', emoji: '💻', keywords: ['freelance', 'contract', 'project'] },
  business:  { name: 'Business',  emoji: '📈', keywords: ['business', 'sale', 'revenue'] },
  investment:{ name: 'Investment',emoji: '📊', keywords: ['invest', 'dividend', 'interest'] },
  gift:      { name: 'Gift',      emoji: '🎁', keywords: ['gift', 'present', 'received'] },
  other:     { name: 'Other',     emoji: '💵', keywords: ['other', 'misc'] },
};

export function findCategory(text, type) {
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const lower = text.toLowerCase();
  for (const [key, cat] of Object.entries(cats)) {
    if (cat.keywords.some(kw => lower.includes(kw))) return { key, ...cat };
  }
  return { key: 'other', ...cats.other };
}

export function getCategoryDisplay(key, type) {
  const cats = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const cat = cats[key];
  return cat ? `${cat.emoji} ${cat.name}` : `📦 ${key}`;
}