import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

// CTA looking element (like button and links)
export const callToAction = cva(
  [
    'tracking-wide font-semibold',
    'rounded-lg border-2',
    'py-[0.75em] px-[0.25em]',
    'transition-colors transition-500',
    'disabled:!opacity-50 disabled:pointer-events-none',
    'focus:outline-none focus:ring-4 focus:ring-offset-2',
  ],
  {
    variants: {
      intent: {
        primary: [
          'bg-primary-9 hover:bg-primary-10 focus:bg-primary-11 focus:text-primary-1 hover:focus:bg-opacity-95',
          'text-primary-12',
          'border-transparent',
        ],
        'primary-outline': [
          'bg-transparent hover:bg-primary-9 focus:bg-primary-11 hover:focus:bg-opacity-95',
          'text-neutral-12 focus:text-primary-3',
          'border-primary-9 focus:border-primary-11',
        ],
        'primary-ghost': [
          'border-transparent bg-primary-4 bg-opacity-0 text-primary-11 hover:bg-opacity-100 focus:border-transparent focus:bg-opacity-100 focus:text-primary-1',
        ],
        'primary-faint': [
          'border-transparent  bg-primary-4 bg-opacity-75 text-primary-11 hover:bg-opacity-50 focus:border-transparent focus:bg-opacity-100 focus:text-primary-11',
        ],
        'interactive-faint': [
          'border-transparent  bg-interactive-4 bg-opacity-75 text-interactive-11 hover:bg-opacity-50 focus:border-transparent focus:bg-opacity-100 focus:text-interactive-11',
        ],
        'interactive-ghost': [
          'border-transparent bg-interactive-4 bg-opacity-0 text-interactive-11 hover:bg-opacity-100 focus:border-transparent focus:bg-opacity-100 focus:text-interactive-1',
        ],
        'interactive-outline': [
          'bg-transparent hover:bg-interactive-9 focus:bg-interactive-11 hover:focus:bg-opacity-95',
          'text-neutral-12 focus:text-interactive-3',
          'border-interactive-9 focus:border-interactive-11',
        ],
        negative: [
          'bg-negative-10 hover:bg-negative-9 focus:bg-negative-11 hover:focus:bg-opacity-95',
          'text-negative-3',
          'border-transparent',
        ],
        'negative-faint': [
          'border-transparent  bg-negative-4 bg-opacity-75 text-negative-11 hover:bg-opacity-50 focus:border-transparent focus:bg-opacity-100 focus:text-negative-11',
        ],
        'negative-outline': [
          'bg-transparent hover:bg-negative-9 hover:text-negative-1 focus:bg-negative-11 hover:focus:bg-opacity-95',
          'text-neutral-12 focus:text-negative-3',
          'border-negative-9 focus:border-negative-11',
        ],
        'negative-ghost': [
          'border-transparent bg-negative-4 bg-opacity-0 text-negative-11 hover:bg-opacity-100 focus:border-transparent focus:bg-opacity-100 focus:text-negative-1',
        ],

        'neutral-on-dark-layer': [
          'border-transparent bg-accent-1 text-accent-12 hover:bg-accent-2 hover:border-accent-1 focus:border-accent-2  focus:bg-accent-12 hover:text-neutral-12 focus:text-accent-1 focus:hover:text-accent-2',
        ],

        'neutral-outline': [
          'bg-accent-1 border-accent-7 hover:border-accent-8 focus:bg-accent-2 focus:border-accent-9  text-accent-11 focus:text-accent-12',
        ],
      },
      scale: {
        default: ['text-xs'],
        lg: ['text-md'],
        sm: ['text-2xs'],
        xs: ['text-2xs'],
      },
    },
    defaultVariants: {
      intent: 'primary',
      scale: 'default',
    },
  },
)

export type SystemUiCTAProps = VariantProps<typeof callToAction>

export default callToAction
