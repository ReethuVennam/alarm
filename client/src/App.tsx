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

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => (
        <ErrorBoundary>
          <Home />
        </ErrorBoundary>
      )} />
      <Route path="/home" component={() => (
        <ErrorBoundary>
          <Home />
        </ErrorBoundary>
      )} />
      <Route path="/timer" component={() => (
        <ErrorBoundary>
          <Timer />
        </ErrorBoundary>
      )} />
      <Route path="/stopwatch" component={() => (
        <ErrorBoundary>
          <Stopwatch />
        </ErrorBoundary>
      )} />
      <Route path="/worldclock" component={() => (
        <ErrorBoundary>
          <WorldClock />
        </ErrorBoundary>
      )} />
      <Route path="/settings" component={() => (
        <ErrorBoundary>
          <Settings />
        </ErrorBoundary>
      )} />
      <Route path="/qr" component={() => (
        <ErrorBoundary>
          <QRCode />
        </ErrorBoundary>
      )} />
      <Route path="/test" component={() => (
        <ErrorBoundary>
          <TestAlarms />
        </ErrorBoundary>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
