import { Match, Switch } from 'solid-js'
import { IconStarFilled } from '~/ui'
import useTranscriptionActions from './useTranscriptionActions'

interface RateProps {
  averageRating: number
  idTranscription: string
  currentUserInitialRating: number
}
export const Rate = (props: RateProps) => {
  const { apiRateTranscription, mutationGiveRating } = useTranscriptionActions({
    averageRating: props?.averageRating,
    id: props.idTranscription,
  })

  return (
    <>
      <div {...apiRateTranscription().rootProps}>
        <label class="sr-only" {...apiRateTranscription().labelProps}>
          Click on the icons below to give your rating :
        </label>
        <div class="flex gap-4 md:gap-1 justify-center" {...apiRateTranscription().controlProps}>
          {apiRateTranscription().sizeArray.map((index) => {
            const state = apiRateTranscription().getRatingState(index)
            return (
              <span
                classList={{
                  'animate-pulse pointer-events-none': mutationGiveRating.isLoading,
                }}
                class="cursor-pointer text-neutral-6 data-[highlighted]:text-interactive-10"
                key={index}
                {...apiRateTranscription().getRatingProps({ index })}
              >
                <IconStarFilled class="w-10 h-10 md:w-8 md:h-8" />
              </span>
            )
          })}
        </div>
        <input {...apiRateTranscription().hiddenInputProps} />
      </div>
      <p class="text-center pt-3 text-accent-11 text-[0.75rem]">0 = bad ; 5 = perfect</p>

      <Switch
        fallback={
          <p class="text-2xs pt-2 text-interactive-12 font-bold">Your rating: {props.currentUserInitialRating}/5</p>
        }
      >
        <Match when={mutationGiveRating.isLoading}>
          <p class="animate-pulse text-center pt-2 font-bold text-2xs text-neutral-9">Saving...</p>
        </Match>
        <Match when={mutationGiveRating.isSuccess}>
          <p class="text-2xs pt-2 text-interactive-12 font-bold">Your rating: {mutationGiveRating?.data}/5</p>
        </Match>
      </Switch>
      <p class="pt-2 italic text-2xs text-neutral-10">Average rating: {props?.averageRating}/5</p>
    </>
  )
}

export default Rate
