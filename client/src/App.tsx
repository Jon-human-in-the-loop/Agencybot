import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Team from "./pages/Team";
import BotEditor from "./pages/BotEditor";
import Simulator from "./pages/Simulator";
import Analytics from "./pages/Analytics";
import LLMConfig from "./pages/LLMConfig";
import Templates from "./pages/Templates";
import Flows from "./pages/Flows";
import VoiceAgents from "./pages/VoiceAgents";
import Integrations from "./pages/Integrations";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/team" component={Team} />
      <Route path="/bot/:id" component={BotEditor} />
      <Route path="/simulator/:id?" component={Simulator} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/llm" component={LLMConfig} />
      <Route path="/templates/:botId?" component={Templates} />
      <Route path="/flows/:botId?" component={Flows} />
      <Route path="/voice" component={VoiceAgents} />
      <Route path="/integrations" component={Integrations} />
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
          <Toaster theme="dark" position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
