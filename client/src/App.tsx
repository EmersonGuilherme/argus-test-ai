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
import Validation from "./pages/Validation";
import McpSecurity from "./pages/McpSecurity";
import AuditTrail from "./pages/AuditTrail";
import ShadowAi from "./pages/ShadowAi";
import Compliance from "./pages/Compliance";
import CiCd from "./pages/CiCd";
import AutonomousTesting from "./pages/AutonomousTesting";
import Privacy from "./pages/Privacy";
import Webhooks from "./pages/Webhooks";
import Organizations from "./pages/Organizations";
import Docs from "./pages/Docs";
import Landing from "./pages/Landing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/landing" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/traces" component={Traces} />
      <Route path="/traces/:id" component={TraceDetail} />
      <Route path="/evaluations" component={Evaluations} />
      <Route path="/security" component={Security} />
      <Route path="/models" component={Models} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/projects" component={Projects} />
      <Route path="/prompts" component={PromptSuggestions} />
      <Route path="/validation" component={Validation} />
      <Route path="/mcp-security" component={McpSecurity} />
      <Route path="/audit-trail" component={AuditTrail} />
      <Route path="/shadow-ai" component={ShadowAi} />
      <Route path="/compliance" component={Compliance} />
      <Route path="/cicd" component={CiCd} />
      <Route path="/autonomous" component={AutonomousTesting} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/webhooks" component={Webhooks} />
      <Route path="/organizations" component={Organizations} />
      <Route path="/docs" component={Docs} />
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
