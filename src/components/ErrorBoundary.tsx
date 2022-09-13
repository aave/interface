import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props: unknown) {
    super(props ?? {});

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error) {
    console.log('from error boundary: derived state', { error });
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.log('from error boundary: caught', { error });
    console.log(error);
    console.log(info);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something Went Wrong in the Component</div>;
    }
    return this.props.children;
  }
}
