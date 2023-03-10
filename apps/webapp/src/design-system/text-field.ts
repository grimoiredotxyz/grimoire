import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

// textual inputs (like textarea and text/number/url input)
export const textField = cva(
  [
    'border py-[0.25em] px-[0.5em]',
    'appearance-none focus:outline-none',
    'border-solid',
    'focus:ring-2',
    'input overflow-hidden text-ellipsis placeholder:text-opacity-40',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      intent: {
        default: [
          'placeholder:text-neutral-12 bg-neutral-1 hover:bg-opacity-3.5 focus:bg-neutral-12:bg-opacity-5  text-neutral-12 border-neutral-8',
        ],
        'pseudo-disabled':
          'placeholder:text-neutral-12 bg-neutral-12 text-neutral-12 border-neutral-12 opacity-50 pointer-events-none border-opacity-20 hover:border-opacity-20',
        error: ['input--invalid'],
      },
      scale: {
        default: ['text-sm'],
        sm: ['text-2xs'],
        lg: ['text-md'],
      },
      appearance: {
        square: 'rounded-md',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      intent: 'default',
      scale: 'default',
      appearance: 'square',
    },
  },
)

export type SystemUiTextFieldProps = VariantProps<typeof textField>

export default textField
