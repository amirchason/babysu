import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PropTypes from 'prop-types';
import { theme, spacing } from '../../utils/theme';
import Button from './Button';

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors in child components and displays a fallback UI.
 * Useful for preventing the entire app from crashing.
 *
 * @example
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback, showDetails } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="alert-circle" size={80} color={theme.colors.error} />
          </View>

          <Text style={styles.title}>Oops! Something went wrong</Text>
          <Text style={styles.message}>
            We're sorry for the inconvenience. The app encountered an unexpected error.
          </Text>

          <Button
            mode="contained"
            onPress={this.handleReset}
            style={styles.button}
            buttonColor={theme.colors.primary}
          >
            Try Again
          </Button>

          {showDetails && this.state.error && (
            <View style={styles.detailsContainer}>
              <Text style={styles.detailsTitle}>Error Details:</Text>
              <Text style={styles.detailsText}>{this.state.error.toString()}</Text>
              {this.state.errorInfo && (
                <Text style={styles.detailsText}>
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </View>
          )}
        </ScrollView>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  onError: PropTypes.func,
  onReset: PropTypes.func,
  showDetails: PropTypes.bool,
};

ErrorBoundary.defaultProps = {
  showDetails: __DEV__, // Show details only in development
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  button: {
    minWidth: 200,
    marginBottom: spacing.lg,
  },
  detailsContainer: {
    width: '100%',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginBottom: spacing.sm,
  },
  detailsText: {
    fontSize: 12,
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;
