import { Component, ErrorInfo, ReactNode } from 'react';

/**
 * TEMPORARY diagnostic boundary (remove before merge). Catches any render-phase
 * crash and surfaces the error + React componentStack — both to the console and
 * visibly in the DOM so it's captured in the cypress failure screenshot. Used to
 * pinpoint the exact component behind the CI "Application error" white-screen.
 */
export class DebugCrashBoundary extends Component<
  { children: ReactNode; label?: string },
  { error: Error | null; componentStack: string }
> {
  state = { error: null as Error | null, componentStack: '' };

  static getDerivedStateFromError(error: Error) {
    return { error, componentStack: '' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const label = this.props.label ?? 'app';
    /* eslint-disable no-console */
    console.error(`[DEBUG_CRASH:${label}] message=`, error?.message);
    console.error(`[DEBUG_CRASH:${label}] stack=`, error?.stack);
    console.error(`[DEBUG_CRASH:${label}] componentStack=`, info?.componentStack);
    /* eslint-enable no-console */
    this.setState({ componentStack: info?.componentStack ?? '' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__DEBUG_CRASH__ = {
      label,
      message: error?.message,
      stack: error?.stack,
      componentStack: info?.componentStack,
    };
  }

  render() {
    if (this.state.error) {
      return (
        <pre
          data-cy="DebugCrash"
          style={{ whiteSpace: 'pre-wrap', padding: 16, fontSize: 11, color: '#b00' }}
        >
          {`DEBUG_CRASH[${this.props.label ?? 'app'}]: ${
            this.state.error.message
          }\n\nCOMPONENT STACK:${this.state.componentStack}\n\nERROR STACK:\n${
            this.state.error.stack
          }`}
        </pre>
      );
    }
    return this.props.children;
  }
}
