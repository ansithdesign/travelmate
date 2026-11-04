export interface Destination {
  name: string
  region: string
}

export const DESTINATIONS: Destination[] = [
  { name: 'Srinagar', region: 'Jammu and Kashmir' },
  { name: 'Gulmarg', region: 'Jammu and Kashmir' },
  { name: 'Pahalgam', region: 'Jammu and Kashmir' },
  { name: 'Leh', region: 'Ladakh' },
  { name: 'Goa', region: 'Goa' },
  { name: 'Gokarna', region: 'Karnataka' },
  { name: 'Bengaluru', region: 'Karnataka' },
  { name: 'Coorg', region: 'Karnataka' },
  { name: 'Hampi', region: 'Karnataka' },
  { name: 'Mysuru', region: 'Karnataka' },
  { name: 'Jaipur', region: 'Rajasthan' },
  { name: 'Udaipur', region: 'Rajasthan' },
  { name: 'Jaisalmer', region: 'Rajasthan' },
  { name: 'Manali', region: 'Himachal Pradesh' },
  { name: 'Spiti Valley', region: 'Himachal Pradesh' },
  { name: 'Kasol', region: 'Himachal Pradesh' },
  { name: 'Rishikesh', region: 'Uttarakhand' },
  { name: 'Munnar', region: 'Kerala' },
  { name: 'Alappuzha', region: 'Kerala' },
  { name: 'Kochi', region: 'Kerala' },
  { name: 'Puducherry', region: 'Puducherry' },
  { name: 'Ooty', region: 'Tamil Nadu' },
  { name: 'Darjeeling', region: 'West Bengal' },
  { name: 'Gangtok', region: 'Sikkim' },
  { name: 'Shillong', region: 'Meghalaya' },
  { name: 'Varanasi', region: 'Uttar Pradesh' },
  { name: 'Mumbai', region: 'Maharashtra' },
  { name: 'New Delhi', region: 'Delhi' },
  { name: 'Port Blair', region: 'Andaman and Nicobar' },
  { name: 'Bali', region: 'Indonesia' },
  { name: 'Singapore', region: 'Singapore' },
  { name: 'Bangkok', region: 'Thailand' },
  { name: 'Dubai', region: 'United Arab Emirates' },
  { name: 'Colombo', region: 'Sri Lanka' },
  { name: 'Kathmandu', region: 'Nepal' },
  { name: 'Hanoi', region: 'Vietnam' },
  { name: 'Tbilisi', region: 'Georgia' },
]

/** [latitude, longitude] for the places in the list, so a trip can be put on the map */
const COORDS: Record<string, [number, number]> = {
  Srinagar: [34.08, 74.8], Gulmarg: [34.05, 74.38], Pahalgam: [34.02, 75.32], Leh: [34.16, 77.58], Goa: [15.5, 73.85], Gokarna: [14.55, 74.32],
  Bengaluru: [12.97, 77.59], Coorg: [12.42, 75.74], Hampi: [15.33, 76.46], Mysuru: [12.3, 76.64], Jaipur: [26.91, 75.79], Udaipur: [24.58, 73.68],
  Jaisalmer: [26.92, 70.9], Manali: [32.24, 77.19], 'Spiti Valley': [32.25, 78.03], Kasol: [32.01, 77.31], Rishikesh: [30.09, 78.27], Munnar: [10.09, 77.06],
  Alappuzha: [9.49, 76.33], Kochi: [9.93, 76.27], Puducherry: [11.93, 79.83], Ooty: [11.41, 76.7], Darjeeling: [27.04, 88.26], Gangtok: [27.33, 88.61],
  Shillong: [25.57, 91.88], Varanasi: [25.32, 83.0], Mumbai: [19.08, 72.88], 'New Delhi': [28.61, 77.21], 'Port Blair': [11.62, 92.73], Bali: [-8.65, 115.2],
  Singapore: [1.35, 103.82], Bangkok: [13.76, 100.5], Dubai: [25.2, 55.27], Colombo: [6.93, 79.86], Kathmandu: [27.72, 85.32], Hanoi: [21.03, 105.85], Tbilisi: [41.72, 44.79],
}

/** Where a trip's destination is, when we know it */
export function coordsFor(name: string): { lat: number; lon: number } | undefined {
  const hit = Object.entries(COORDS).find(([k]) => k.toLowerCase() === name.trim().toLowerCase())
  return hit ? { lat: hit[1][0], lon: hit[1][1] } : undefined
}
