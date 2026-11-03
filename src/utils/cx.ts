import { extendTailwindMerge } from 'tailwind-merge'

// Teach the merger the custom type scale so `text-meta` is treated as a font size, not a colour.
const merge = extendTailwindMerge({
  extend: {
    theme: { text: ['display', 'title', 'heading', 'body', 'meta', 'caption', 'figure'] },
  },
})

/** Join class names; later Tailwind classes win over earlier conflicting ones (caller overrides base). */
export function cx(...parts: Array<string | false | null | undefined | 0>): string {
  return merge(parts.filter(Boolean).join(' '))
}
