import { For } from "solid-js"
import { textField } from '~/design-system'
import type { SystemUiTextFieldProps } from '~/design-system'
import { IconClose } from "../Icons"

interface FormTagsInputProps extends SystemUiTextFieldProps{
    api: any
    hasError?: boolean
    classInput?: string
    classWrapper?: string
    placeholder?:string
}

export const FormTagsInput = (props: FormTagsInputProps) => {

  return (
    <div class={props?.classWrapper ?? ""} {...props.api().rootProps}>
      <input placeholder={props?.placeholder ??  "Type your tag and press 'Enter'..."}  class={textField({
        scale: props?.scale ?? 'default',
        appearance: props.appearance ?? 'square',
        variant: props?.hasError === true ? 'error' : 'default',
        //@ts-ignore
        class: `w-full ${props?.classInput ?? ''}`,

      })} {...props.api().inputProps} />
      <div class="flex flex-wrap gap-4 pt-2">
            <For each={props.api().value}>
        {(value, index) => (
          <span class="inline-flex border focus-within:ring-2 text-xs rounded bg-interactive-1 border-interactive-7 focus-within:border-interactive-10 px-2 text-interactive-11"
          >
            <div class="flex items-center" {...props.api().getTagProps({ index: index(), value })}>
              <span class="block w-full h-full">{value} </span>
              <button
                {...props.api().getTagDeleteTriggerProps({ index: index(), value })}
              >
                <IconClose class="mis-1ex w-3 h-3" stroke-width="2"/>
              </button>
            </div>
            <input {...props.api().getTagInputProps({ index: index(), value })} />
          </span>
        )}
      </For>
      </div>
    </div>
  )
}