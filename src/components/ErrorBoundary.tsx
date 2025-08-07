
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('ErrorBoundary capturou erro:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Detalhes do erro capturado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    console.log('ErrorBoundary - Tentando recuperar...');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-tech-darker p-4">
          <Card className="bg-tech-card/95 backdrop-blur-sm border-tech-accent/20 shadow-lg max-w-md w-full">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <CardTitle className="text-white">Oops! Algo deu errado</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-300">
                Encontramos um problema inesperado. Tente recarregar a página.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={this.handleRetry}
                  className="tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-medium transition-all duration-300 w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="tech-gradient hover:shadow-lg hover:shadow-tech-highlight/20 text-white font-medium transition-all duration-300 w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recarregar Página
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="border-tech-accent text-tech-highlight hover:bg-tech-accent/20 w-full"
                >
                  Voltar ao Início
                </Button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-red-900/20 rounded border border-red-700 text-left">
                  <summary className="text-red-300 cursor-pointer">Detalhes do erro (dev)</summary>
                  <pre className="text-xs text-red-200 mt-2 overflow-auto max-h-40">
                    {this.state.error.message}
                    {this.state.error.stack}
                    {this.state.errorInfo && (
                      <>
                        {'\n\nComponent Stack:'}
                        {this.state.errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
