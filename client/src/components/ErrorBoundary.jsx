import { Component } from 'react';
import { Link } from 'react-router';
import { ThemeContext } from '../context/ThemeContext';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemeContext.Consumer>
          {({ theme }) => {
            const isDark = theme === 'dark';
            return (
              <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${isDark ? 'bg-dark-500 text-white' : 'bg-[#F5F3EF] text-gray-900'}`}>
                <div className="text-center">
                  <h1 className="font-serif text-4xl font-bold mb-4">Something went wrong</h1>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-8`}>An unexpected error occurred. Please try again.</p>
                  <Link to="/" onClick={() => this.setState({ hasError: false })} className="btn-gold">
                    Back to Home
                  </Link>
                </div>
              </div>
            );
          }}
        </ThemeContext.Consumer>
      );
    }
    return this.props.children;
  }
}
