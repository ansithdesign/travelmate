import type { Photo } from '../types'

/**
 * Cover photos supplied by the owner: twenty landscapes and places, bundled with the
 * app so they always load. Every <Cover> still has a painted fallback behind the photo.
 */
const FILES = import.meta.glob('../assets/covers/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const src = (name: string) => FILES[`../assets/covers/${name}.webp`]

const p = (name: string, alt: string): Photo => ({ id: `cv-${name}`, src: src(name), alt })

export const PHOTOS = {
  goaBeach: p('goa-beach', 'A palm-fringed beach at sunset'),
  kashmirLake: p('kashmir-lake', 'Snow-covered peaks reflected in a still lake'),
  munnarTea: p('munnar-tea', 'Tea estate hills in morning mist'),
  keralaBackwaters: p('kerala-backwaters', 'A houseboat on glassy backwaters at dawn'),
  westernGhatsFalls: p('western-ghats-falls', 'A waterfall in a deep green rainforest'),
  tharDunes: p('thar-dunes', 'Desert dunes at sunset with a winding track'),
  alpineMeadow: p('alpine-meadow', 'A wildflower meadow above misty ridgelines'),
  andamanLagoon: p('andaman-lagoon', 'A turquoise lagoon with a wooden boat'),
  pineForest: p('pine-forest', 'A forest path with beams of light'),
  valleyDusk: p('valley-dusk', 'A mountain valley at blue hour with a lit village'),
  hillFort: p('hill-fort', 'A hill fort at dusk'),
  lakePalace: p('lake-palace', 'A lake palace reflected at sunrise'),
  varanasiGhats: p('varanasi-ghats', 'Riverside ghats at dawn'),
  rishikeshBridge: p('rishikesh-bridge', 'A suspension bridge over a turquoise river'),
  hampiRuins: p('hampi-ruins', 'Ancient ruins among boulders in golden light'),
  pondicherryStreet: p('pondicherry-street', 'A yellow colonial street with bougainvillaea'),
  darjeelingTrain: p('darjeeling-train', 'A narrow-gauge train winding through green hills'),
  coastRoad: p('coast-road', 'A cliffside coastal road by the sea'),
  starryCamp: p('starry-camp', 'A glowing tent under the Milky Way'),
  riceTerraces: p('rice-terraces', 'Rice terraces in soft morning light'),
} satisfies Record<string, Photo>

/** Covers offered in the trip form: all twenty. */
export const COVER_LIBRARY: Photo[] = Object.values(PHOTOS)

/** Trips saved before the bundled covers used Unsplash links. Carry them onto the closest new photo. */
export const LEGACY_PHOTO: Record<string, Photo> = {
  'us-vlTihequ9yo': PHOTOS.kashmirLake,
  'us-72GwiojCwoI': PHOTOS.kashmirLake,
  'us-hcRK-x_H21g': PHOTOS.kashmirLake,
  'us-8jdUZzBU2yU': PHOTOS.valleyDusk,
  'us-SmDDOpLQ9nk': PHOTOS.alpineMeadow,
  'us-M5AR9jscKgM': PHOTOS.goaBeach,
  'us-WSe6NAwwESA': PHOTOS.keralaBackwaters,
  'us-nlxNKMpUHbY': PHOTOS.andamanLagoon,
  'us-I9qh1Q_tgfU': PHOTOS.goaBeach,
  'us-qI97C620KMg': PHOTOS.pineForest,
  'us-PfV40sukkN8': PHOTOS.munnarTea,
  'us-nuIpe_EumH4': PHOTOS.westernGhatsFalls,
}
