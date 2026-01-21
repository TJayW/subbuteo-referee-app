import AppShell from "./AppShell";
import { ConsoleFocusProvider } from "@/hooks/use-console-focus-manager";
import ErrorBoundary from "@/ui/components/ErrorBoundary";
import { WatchStream } from "@/features/streaming/WatchStream";
import { useHashRouter } from "@/utils/hash-router";
import { StreamingProvider } from "@/contexts/StreamingContext";

function App() {
  const route = useHashRouter();

  // Watch stream page (needs StreamingProvider for viewer functionality)
  if (route.path === '/watch' && route.params.streamKey) {
    return (
      <ErrorBoundary>
        <StreamingProvider>
          <WatchStream />
        </StreamingProvider>
      </ErrorBoundary>
    );
  }

  // Main app (wrapped in StreamingProvider for global streaming state)
  return (
    <ErrorBoundary>
      <StreamingProvider>
        <ConsoleFocusProvider>
          <AppShell />
        </ConsoleFocusProvider>
      </StreamingProvider>
    </ErrorBoundary>
  );
}

export default App;
