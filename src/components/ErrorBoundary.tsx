import { Component } from 'react';

export class ErrorBoundary extends Component {
  // eslint-disable-next-line
  // @ts-ignore
  constructor(props: unknown) {
    // eslint-disable-next-line
    // @ts-ignore
    super(props ?? {});

    this.state = {
      hasError: false,
    };
  }

  // eslint-disable-next-line
// @ts-ignore
  static getDerivedStateFromError(error) {
    console.log('from error boundary: derived state', { error });
    return {
      hasError: true,
    };
  }

  // eslint-disable-next-line
// @ts-ignore
  componentDidCatch(error, info) {
    console.log('from error boundary: caught', { error });
    console.log(error);
    console.log(info);
  }

  render() {
    // eslint-disable-next-line
// @ts-ignore
    if (this.state.hasError) {
      return <div>Something Went Wrong in the Component</div>;
    }
    return this.props.children;
  }
}
