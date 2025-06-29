import { inject } from "@vercel/analytics";
import { onMount } from "solid-js";

export function Analytics() {
  onMount(() => {
    inject();
  });

  return null;
}
