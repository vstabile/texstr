/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import { Route, Router } from "@solidjs/router";
import { nip19 } from "nostr-tools";
import Home from "./pages/Home";
import Article from "./pages/Article";
import NotFound from "./pages/NotFound";

const root = document.getElementById("root");

const filters = {
  naddr: (naddr: string) => {
    try {
      const decoded = nip19.decode(naddr);
      return decoded.type === "naddr";
    } catch {
      return false;
    }
  },
};

render(
  () => (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/a/:naddr" component={Article} matchFilters={filters} />
      <Route path="*" component={NotFound} />
    </Router>
  ),
  root!
);
