export const EXPENSE_CATEGORIES = {
  food:          { name: "غذا",          emoji: "🍽️", keywords: ["غذا", "food", "رستوران", "restaurant", "کafe", "ناهار", "lunch", "شام", "dinner", "صبحانه", "breakfast", "چای", "قهوه", "coffee"] },
  transport:     { name: "حمل‌ونقل",     emoji: "🚕", keywords: ["taxi", "تاکسی", "اتوبوس", "bus", "مترو", "metro", "بنزین", "fuel", "گاز", "gas", "ماشین", "car"] },
  shopping:      { name: "خرید",         emoji: "🛍️", keywords: ["خرید", "shop", "فروشگاه", "store", "لباس", "clothes", "بازار"] },
  entertainment: { name: "سرگرمی",       emoji: "🎮", keywords: ["بازی", "game", "فیلم", "movie", "سینما", "cinema", "موسیقی", "music", "تفریح"] },
  bills:         { name: "قبوض",         emoji: "📄", keywords: ["قبض", "bill", "برق", "electricity", "آب", "water", "اینترنت", "internet", "تلفن", "phone", "اجاره", "rent"] },
  health:        { name: "بهداشت",       emoji: "🏥", keywords: ["پزشک", "doctor", "دارو", "medicine", "بیمارستان", "hospital", "داروخانه", "pharmacy"] },
  education:     { name: "آموزش",        emoji: "📚", keywords: ["آموزش", "education", "مدرسه", "school", "دوره", "course", "کتاب", "book"] },
  travel:        { name: "سفر",          emoji: "✈️", keywords: ["سفر", "travel", "هواپیما", "flight", "هتل", "hotel"] },
  gifts:         { name: "هدیه",         emoji: "🎁", keywords: ["هدیه", "gift", "کمک", "charity", "نذر"] },
  family:        { name: "خانواده",      emoji: "👨‍👩‍👧‍👦", keywords: ["خانواده", "family", "بچه", "child", "مهد"] },
  clothing:      { name: "پوشاک",        emoji: "👔", keywords: ["لباس", "clothing", "کفش", "shoes", "کت"] },
  other:         { name: "متفرقه",       emoji: "📦", keywords: ["other", "متفرقه", "misc"] },
};

export const INCOME_CATEGORIES = {
  salary:    { name: "حقوق",      emoji: "💰", keywords: ["حقوق", "salary", "wage", "درآمد"] },
  freelance: { name: "فریلنسری",  emoji: "💻", keywords: ["freelance", "پروژه", "project", "قرارداد"] },
  business:  { name: "کسب‌وکار",  emoji: "📈", keywords: ["بیزینس", "فروش", "sale", "درآمد", "revenue"] },
  investment:{ name: "سرمایه‌گذاری",emoji: "📊", keywords: ["سرمایه", "سود", "dividend", "بهره"] },
  gift:      { name: "هدیه دریافتی",emoji: "🎁", keywords: ["هدیه", "gift", "دریافت", "received"] },
  loan:      { name: "قرض",       emoji: "🤝", keywords: ["قرض", "loan", "وام", "debts"] },
  refund:    { name: "بازگشت وجه",emoji: "🔄", keywords: ["بازگشت", "refund", "برگشت"] },
  other:     { name: "سایر",      emoji: "💵", keywords: ["other", "سایر", "misc"] },
};

export function findCategory(text, type) {
  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const lower = text.toLowerCase();
  for (const [key, cat] of Object.entries(cats)) {
    if (cat.keywords.some(kw => lower.includes(kw))) return { key, ...cat };
  }
  return { key: "other", ...cats.other };
}

export function getCategoryDisplay(key, type) {
  const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const cat = cats[key];
  return cat ? `${cat.emoji} ${cat.name}` : `📦 ${key}`;
}