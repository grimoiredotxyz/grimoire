import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

// CTA looking element (like button and links)
export const callToAction = cva(
  [
    'tracking-wide font-semibold',
    'rounded-full border',
    'px-[1em]',
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
          'text-primary-12 focus:text-primary-3',
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
          'text-interactive-12 focus:text-interactive-3',
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
          'text-negative-12 focus:text-negative-3',
          'border-negative-9 focus:border-negative-11',
        ],
        'negative-ghost': [
          'border-transparent bg-negative-4 bg-opacity-0 text-negative-11 hover:bg-opacity-100 focus:border-transparent focus:bg-opacity-100 focus:text-negative-1',
        ],
        'neutral-on-light-layer': [
          'border-transparent bg-accent-12 text-accent-1 hover:bg-neutral-12 hover:border-accent-12 focus:border-accent-12 hover:border-opacity-50 focus:border-opacity-50 focus:bg-accent-1 hover:text-accent-1 focus:text-accent-12',
        ],
        'neutral-on-dark-layer': [
          'border-transparent bg-accent-1 text-accent-12 hover:bg-accent-2 hover:border-accent-1 focus:border-accent-2  focus:bg-accent-12 hover:text-neutral-12 focus:text-accent-1 focus:hover:text-accent-2',
        ],
        'neutral-outline': [
          'bg-accent-1 border-accent-7 hover:border-accent-8 focus:bg-accent-2 focus:border-accent-10  text-accent-11 hover:text-neutral-12 focus:text-accent-12',
        ],
        // Chains specific
        'chiado-outline': [
          'border-[#24644c] hover:bg-opacity-90 hover:bg-[#24644c] focus:bg-[#24644c] text-neutral-12 hover:text-neutral-1 focus:text-white',
        ],
        'maticmum-outline': [
          'border-[#ad7dff] hover:bg-opacity-90 hover:bg-[#ad7dff] focus:bg-[#ad7dff] text-neutral-12 hover:text-neutral-1 focus:text-white',
        ],
        'optimism-goerli-outline': [
          'border-[#eb001a] hover:bg-opacity-90 hover:bg-[#eb001a] focus:bg-[#eb001a] text-neutral-12 hover:text-neutral-1 focus:text-white',
        ],
        'filecoin-hyperspace-outline': [
          'border-[#194ec9] hover:bg-opacity-90 hover:bg-[#194ec9] focus:bg-[#194ec9] text-neutral-12 hover:text-neutral-1 focus:text-white',
        ],
        'scrollAlpha-outline': [
          'border-[#f18740] hover:bg-opacity-90 hover:bg-[#f18740] focus:bg-[#f18740] text-neutral-12 hover:text-neutral-1 focus:text-white',
        ],
      },
      scale: {
        default: ['text-xs py-[0.9em]'],
        lg: ['text-md py-[0.85em]'],
        sm: ['text-2xs py-[0.25em]'],
        xs: ['text-2xs py-[0.25em]'],
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
