import { Trans } from '@lingui/macro';
import { Alert, Box, Button, Typography } from '@mui/material';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * TransactionErrorBoundary
 * 
 * Catches errors that occur within transaction modals and provides
 * a graceful recovery mechanism. This prevents the entire app from
 * crashing when wallet-related errors occur.
 * 
 * Specifically handles:
 * - Wallet disconnection errors
 * - Transaction failures
 * - Unexpected modal state errors
 */
export class TransactionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('[TransactionErrorBoundary] Caught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Check if the error is wallet-related
      const isWalletError = 
        this.state.error?.message?.toLowerCase().includes('wallet') ||
        this.state.error?.message?.toLowerCase().includes('user') ||
        this.state.error?.message?.toLowerCase().includes('account');

      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            minHeight: 200,
          }}
        >
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            <Typography variant="h6" gutterBottom>
              <Trans>Something went wrong</Trans>
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {isWalletError ? (
                <Trans>
                  There was an issue with your wallet connection. Please reconnect your wallet and try again.
                </Trans>
              ) : (
                <Trans>
                  An unexpected error occurred. Please refresh the page and try again.
                </Trans>
              )}
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mt: 1 }}>
                {this.state.error.toString()}
              </Typography>
            )}
          </Alert>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {isWalletError ? (
              <ConnectWalletButton />
            ) : (
              <Button variant="contained" onClick={this.handleReset}>
                <Trans>Try Again</Trans>
              </Button>
            )}
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
            >
              <Trans>Refresh Page</Trans>
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}