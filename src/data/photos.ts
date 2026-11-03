import type { Photo } from '../types'

/**
 * Real Unsplash photographs (Unsplash License). IDs were confirmed through search;
 * the build environment could not download them, so they are hotlinked through
 * Unsplash's download endpoint and every <Cover> has a designed fallback.
 */
export function unsplash(id: string, width = 1200): string {
  return `https://unsplash.com/photos/${id}/download?w=${width}`
}

const p = (id: string, alt: string, credit: string): Photo => ({ id: `us-${id}`, src: unsplash(id), alt, credit })

export const PHOTOS = {
  kashmirShikara: p('vlTihequ9yo', 'Shikaras carrying visitors across Dal Lake, Srinagar', 'Kabir van Wegen'),
  kashmirHouseboats: p('72GwiojCwoI', 'Houseboats on Dal Lake below snow covered mountains', 'Unsplash'),
  kashmirBoatIsland: p('hcRK-x_H21g', 'A shikara crossing Dal Lake near an island', 'Amit Jain'),
  kashmirUmbrella: p('8jdUZzBU2yU', 'A boatman under an umbrella on Dal Lake', 'Unsplash'),
  kashmirNigeen: p('SmDDOpLQ9nk', 'A boat on Nigeen Lake, Srinagar', 'Haziq Farooqi'),
  goaKakolem: p('M5AR9jscKgM', 'Kakolem beach seen from the hillside, South Goa', 'Chirayu Sharma'),
  goaPalolem: p('WSe6NAwwESA', 'Palm trees along Palolem beach', 'Kotagauni Srinivas'),
  goaCloudy: p('nlxNKMpUHbY', 'A sandy cove ringed by palms on a cloudy day', 'Chirayu Sharma'),
  goaSunset: p('I9qh1Q_tgfU', 'Sunset over the Arabian Sea with a palm in the foreground', 'Chirayu Sharma'),
  blrVidhana: p('qI97C620KMg', 'Vidhana Soudha under a clear sky, Bengaluru', 'Arif Khan'),
  blrCubbon: p('PfV40sukkN8', 'Trees and lawns in Cubbon Park, Bengaluru', 'Mohnish Landge'),
  blrTree: p('nuIpe_EumH4', 'A large rain tree in a Bengaluru park', 'Nithin Purple'),
} satisfies Record<string, Photo>

/** Covers offered in the trip form. */
export const COVER_LIBRARY: Photo[] = [
  PHOTOS.kashmirShikara,
  PHOTOS.kashmirHouseboats,
  PHOTOS.goaKakolem,
  PHOTOS.goaPalolem,
  PHOTOS.goaSunset,
  PHOTOS.blrVidhana,
  PHOTOS.blrCubbon,
  PHOTOS.kashmirNigeen,
]
