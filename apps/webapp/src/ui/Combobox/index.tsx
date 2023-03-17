import { createEffect, Show } from 'solid-js'
import { textField } from '~/design-system'
import type { SystemUiTextFieldProps } from '~/design-system'
import { IconChevronDown } from '../Icons'
import type { JSX } from 'solid-js'

interface ComboboxProps extends SystemUiTextFieldProps {
  class?: string
  hasError?: boolean
  api: any
  label: JSX.Element
  options: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
}

export const Combobox = (props: ComboboxProps) => {
  return (
    <div class="relative">
      <div {...props.api().rootProps}>
        <label {...props.api().labelProps}>{props.label}</label>
        <div class="flex focus-within:ring-2 rounded-md" {...props.api().controlProps}>
          <input
            class={`w-full ${textField({
              appearance: props.appearance ?? 'square',
              scale: props.scale ?? 'default',
              variant: props?.hasError === true ? 'error' : 'default',
              class: 'rounded-ie-none focus:!ring-transparent',
            })}`}
            {...props.api().inputProps}
          />
          <button
            class="border border-neutral-8 shrink-0 w-9  border-is-0 rounded-ie-md flex items-center justify-center"
            {...props.api().triggerProps}
          >
            <IconChevronDown stroke-width="2" class="w-4 h-4" />
          </button>
        </div>
      </div>
      <div class="z-10 w-full" {...props.api().positionerProps}>
        <Show when={props.options().length > 0}>
          <ul
            class="bg-neutral-1 border border-neutral-8 shadow-md max-h-[120px] overflow-y-auto rounded-md"
            {...props.api().contentProps}
          >
            {props.options().map((item, index) => (
              <li
                class="px-3 py-2 data-[highlighted]:bg-neutral-3 data-[highlighted]:font-medium cursor-pointer"
                key={`${item.value}:${index}`}
                {...props.api().getOptionProps({
                  label: item.label,
                  value: item.value,
                  index,
                  disabled: item.disabled,
                })}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </Show>
      </div>
    </div>
  )
}
export default Combobox
