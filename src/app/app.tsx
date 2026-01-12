import AppShell from "./AppShell";
import { ConsoleFocusProvider } from "@/hooks/use-console-focus-manager";
import ErrorBoundary from "@/ui/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ConsoleFocusProvider>
        <AppShell />
      </ConsoleFocusProvider>
    </ErrorBoundary>
  );
}

export default App;
