import { Route, Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { MetaProvider } from "@solidjs/meta";
import NotFound from "./routes/404";
import { ThemeProvider } from "./components/ThemeProvider";

export default function App() {
  return (
    <Router
      root={(props) => (
        <ThemeProvider>
          <MetaProvider>
            <Suspense>
              <div class="min-h-screen bg-background text-foreground font-serif flex flex-col">
                <Header />
                {props.children}
                <Footer />
              </div>
            </Suspense>
          </MetaProvider>
        </ThemeProvider>
      )}
    >
      <FileRoutes />
      <Route path="*" component={NotFound} />
    </Router>
  );
}
