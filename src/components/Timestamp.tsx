import { createSignal, Match, Switch } from "solid-js";
import { isServer } from "solid-js/web";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Timestamp as TimestampAction } from "~/actions/timestamp";
import {
  createPartialOTS,
  upgradeOTS,
  getPartialProof,
  removeFullProof,
} from "~/stores/otsStore";
import { timestampToBase64 } from "~/lib/ots";
import { Article } from "~/models/article";
import {
  canUpgrade,
  Timestamp as TimestampType,
} from "@lacrypta/typescript-opentimestamps";
import { actionHub } from "~/lib/actionHub";

export default function Timestamp(props: { article: Article }) {
  const [isRequesting, setIsRequesting] = createSignal(false);
  const [isWaiting, setIsWaiting] = createSignal(false);
  const [isStamping, setIsStamping] = createSignal(false);
  const [partialOTS, setPartialOTS] = createSignal<TimestampType | null>(
    isServer ? null : getPartialProof(props.article.id)
  );

  async function requestTimestamp() {
    setIsRequesting(true);

    try {
      const partialTimestamp = await createPartialOTS(props.article.id);
      setPartialOTS(partialTimestamp);
      console.log("partialTimestamp", partialTimestamp);

      if (partialTimestamp) {
        setIsWaiting(true);
        setTimeout(() => setIsWaiting(false), 60 * 1000);
      } else {
        setIsWaiting(false);
      }
    } catch (error) {
      console.error("Failed to request timestamp:", error);
    } finally {
      setIsRequesting(false);
    }
  }

  async function stamp() {
    setIsStamping(true);

    try {
      const readyToUpgrade = canUpgrade(partialOTS()!);

      if (!readyToUpgrade) {
        console.error("Cannot upgrade timestamp yet.");
        setIsStamping(false);
        return;
      }

      const upgradedTimestamp = await upgradeOTS(
        props.article.id,
        readyToUpgrade
      );

      if (upgradedTimestamp) {
        // Serialize the upgraded timestamp for Nostr event
        const base64OTS = timestampToBase64(upgradedTimestamp);

        try {
          await actionHub.run(TimestampAction, props.article.event, base64OTS);
          // Clear the partial OTS from component state and remove the full proof from store
          setPartialOTS(null);
          removeFullProof(props.article.id);
        } catch (error) {
          console.error("Failed to publish timestamp:", error);
        }
      }
    } catch (error) {
      setIsWaiting(true);
      setTimeout(() => setIsWaiting(false), 60 * 1000);
      console.error("Failed to upgrade timestamp:", error);
    } finally {
      setIsStamping(false);
    }
  }

  function downloadOTS() {
    if (isServer) return;

    console.log("downloading...");
    const ots = props.article.ots;
    const binaryStr = atob(ots!);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.article.id}.ots`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Tooltip>
      <TooltipTrigger>
        <div>{props.article.formatedDate}</div>
      </TooltipTrigger>
      <TooltipContent>
        <Switch>
          <Match when={props.article.ots}>
            <div class="flex flex-col items-center gap-2">
              <div>Timestamped {props.article.timestampedAt} (unverified)</div>
              <button
                class="text-xs cursor-pointer bg-primary text-primary-foreground px-2 py-1 rounded-md disabled:opacity-50"
                onClick={downloadOTS}
                disabled={!props.article.ots}
              >
                Download OTS file
              </button>
            </div>
          </Match>
          <Match when={!partialOTS()}>
            <div class="flex flex-row items-center gap-2">
              <div>Unverified</div>
              <button
                class="text-xs cursor-pointer bg-primary text-primary-foreground px-2 py-1 rounded-md disabled:opacity-50"
                disabled={isRequesting()}
                onClick={requestTimestamp}
              >
                {isRequesting() ? "Requesting..." : "Request Stamp"}
              </button>
            </div>
          </Match>
          <Match when={partialOTS() && isWaiting()}>
            <div>Waiting for timestamp confirmation...</div>
          </Match>
          <Match when={partialOTS() && !isWaiting()}>
            <div class="flex flex-row items-center gap-2">
              <div>Ready to stamp?</div>
              <button
                class="text-xs cursor-pointer bg-primary text-primary-foreground px-2 py-1 rounded-md disabled:opacity-50"
                disabled={isStamping()}
                onClick={stamp}
              >
                {isStamping() ? "Stamping..." : "Stamp it"}
              </button>
            </div>
          </Match>
        </Switch>
      </TooltipContent>
    </Tooltip>
  );
}
