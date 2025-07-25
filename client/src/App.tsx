import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Home from "@/pages/home";
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
