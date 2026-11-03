import type { CategoryId } from '../types'

const RULES: [RegExp, CategoryId][] = [
  [/flight|airline|indigo|vistara|air india|akasa|boarding/i, 'flights'],
  [/hotel|stay|hostel|homestay|houseboat|villa|cottage|airbnb|resort|room|lodge/i, 'accommodation'],
  [/cab|taxi|uber|ola|auto|fuel|petrol|diesel|toll|train|bus|metro|scooter|bike|rental|transfer|parking|ferry/i, 'transport'],
  [/dinner|lunch|breakfast|brunch|food|cafe|coffee|chai|restaurant|thali|drinks|bar|beer|grocer|snack|dhaba|wazwan|mart/i, 'food'],
  [/ticket|entry|tour|gondola|trek|museum|park|parasail|safari|activity|show|boat|rafting|ski/i, 'activities'],
  [/shop|souvenir|market|shawl|gift|book|clothes|spices/i, 'shopping'],
]

export function guessCategory(text: string): CategoryId | undefined {
  for (const [re, cat] of RULES) if (re.test(text)) return cat
  return undefined
}
