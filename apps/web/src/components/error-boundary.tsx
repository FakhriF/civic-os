import { Component, type ErrorInfo, type ReactNode } from "react";
import { Alert, Button, Stack } from "@mantine/core";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
    override state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    override componentDidCatch(error: Error, info: ErrorInfo): void {
        if (import.meta.env.DEV) {
            console.error("[boundary]", error, info.componentStack);
        }
        // later: report(error, { componentStack: info.componentStack })                                                                                                        
    }

    override render(): ReactNode {
        if (this.state.error) {
            return (
                <Stack p="xl">
                    <Alert color="red" title="Something went wrong">
                        {this.state.error.message}
                    </Alert>
                    <Button onClick={() => this.setState({ error: null })}>Try again</Button>
                </Stack>
            );
        }
        return this.props.children;
    }
}                                                      