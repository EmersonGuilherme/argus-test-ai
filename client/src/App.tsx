import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Traces from "./pages/Traces";
import TraceDetail from "./pages/TraceDetail";
import Evaluations from "./pages/Evaluations";
import Security from "./pages/Security";
import Models from "./pages/Models";
import Alerts from "./pages/Alerts";
import Projects from "./pages/Projects";
import PromptSuggestions from "./pages/PromptSuggestions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/traces" component={Traces} />
      <Route path="/traces/:id" component={TraceDetail} />
      <Route path="/evaluations" component={Evaluations} />
      <Route path="/security" component={Security} />
      <Route path="/models" component={Models} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/projects" component={Projects} />
      <Route path="/prompts" component={PromptSuggestions} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
