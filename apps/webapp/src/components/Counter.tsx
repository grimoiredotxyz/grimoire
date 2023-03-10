import { createSignal } from "solid-js";
import { Button, FormInput, FormSelect } from "~/ui";

export default function Counter() {
  const [count, setCount] = createSignal(0);
  return (
    <div class="container mx-auto">
    <div class="flex space-y-3 flex-col">
      <FormInput placeholder="default" scale="default" hasError={false} />
      <FormInput placeholder="sm" scale="sm" hasError={false} />
      <FormInput placeholder="lg" scale="lg" hasError={false} />

      <FormSelect hasError={false}>
<option>Hey</option>
<option>Oh</option>

      </FormSelect>

    <Button intent="primary">
      Hello
    </Button>
    <Button intent="primary-faint">
      Hello
    </Button>
    <Button intent="primary-ghost">
      Hello
    </Button>
    <Button intent="primary-outline">
      Hello
    </Button>

    <Button intent="interactive-faint">
      inte
    </Button>

    <Button intent="interactive-ghost">
      Hello
    </Button>
    <Button intent="interactive-outline">
      Hello
    </Button>

    <Button intent="negative">
      Negative
    </Button>
    <Button intent="negative-faint">
      Negative
    </Button>
    <Button intent="negative-ghost">
      Negative
    </Button>
    <Button intent="negative-outline">
      Negative
    </Button>

    <Button intent="neutral-on-dark-layer">
      Negative
    </Button>

    <Button intent="neutral-outline">
      Negative
    </Button>
    </div>

    </div>
    );
}
