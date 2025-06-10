import { QueryStore } from "applesauce-core";
import { eventStore } from "./eventStore";

export const queryStore = new QueryStore(eventStore);
