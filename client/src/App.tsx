import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "@/pages/home";
import Timer from "@/pages/timer";
import Stopwatch from "@/pages/stopwatch";
import WorldClock from "@/pages/worldclock";
import Settings from "@/pages/settings";
import QRCode from "@/pages/qr-code";
import TestAlarms from "@/pages/test-alarms";
import NotFound from "@/pages/not-found";
import { AlarmsProvider } from "@/hooks/AlarmsContext";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <ErrorBoundary>
          <Home />
        </ErrorBoundary>
      </Route>
      <Route path="/home">
        <ErrorBoundary>
          <Home />
        </ErrorBoundary>
      </Route>
      <Route path="/timer">
        <ErrorBoundary>
          <Timer />
        </ErrorBoundary>
      </Route>
      <Route path="/stopwatch">
        <ErrorBoundary>
          <Stopwatch />
        </ErrorBoundary>
      </Route>
      <Route path="/worldclock">
        <ErrorBoundary>
          <WorldClock />
        </ErrorBoundary>
      </Route>
      <Route path="/settings">
        <ErrorBoundary>
          <Settings />
        </ErrorBoundary>
      </Route>
      <Route path="/qr">
        <ErrorBoundary>
          <QRCode />
        </ErrorBoundary>
      </Route>
      <Route path="/test">
        <ErrorBoundary>
          <TestAlarms />
        </ErrorBoundary>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <AlarmsProvider>
              <Toaster />
              <Router />
            </AlarmsProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
