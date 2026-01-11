import AppShell from "./AppShell";
import { ConsoleFocusProvider } from "@/hooks/use-console-focus-manager";

function App() {
  return (
    <ConsoleFocusProvider>
      <AppShell />
    </ConsoleFocusProvider>
  );
}

export default App;
