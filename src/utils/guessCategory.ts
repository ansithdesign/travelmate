import type { CategoryId } from '../types'

const RULES: [RegExp, CategoryId][] = [
  [/flight|airline|indigo|vistara|air india|akasa|boarding/i, 'flights'],
  [/hotel|stay|hostel|homestay|houseboat|villa|cottage|airbnb|resort|room|lodge/i, 'stay'],
  [/fuel|petrol|diesel|toll|fastag/i, 'fuel'],
  [/scooter|bike rental|car rental|rental|self.?drive|rent a/i, 'rentals'],
  [/cab|taxi|uber|\bola\b|rapido|auto|transfer|ride|train|bus|metro|ferry/i, 'cabs'],
  [/grocer|supermarket|mart|vegetables|fruits|water bottle|provisions/i, 'groceries'],
  [/cafe|coffee|chai|tea|juice|drinks|bar|beer|feni|wine|cocktail/i, 'drinks'],
  [/dinner|lunch|breakfast|brunch|food|restaurant|thali|dhaba|wazwan|snack|meal/i, 'food'],
  [/museum|entry|ticket|fort|palace|temple|monument|park|garden|sightseeing|lalbagh/i, 'sightseeing'],
  [/gondola|trek|parasail|safari|activity|show|boat|rafting|ski|dive|surf|camp/i, 'activities'],
  [/gift|souvenir|shawl|handicraft/i, 'gifts'],
  [/pharmacy|medicine|doctor|clinic|hospital|health/i, 'health'],
  [/visa|sim|insurance|passport|permit|esim/i, 'admin'],
  [/shop|market|book|clothes|spices|mall/i, 'shopping'],
]

export function guessCategory(text: string): CategoryId | undefined {
  for (const [re, cat] of RULES) if (re.test(text)) return cat
  return undefined
}
