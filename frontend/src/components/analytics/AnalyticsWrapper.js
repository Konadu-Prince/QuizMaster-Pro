/**
 * Analytics Wrapper - Ensures Router context is available
 */

import React from 'react';
import { useLocation } from 'react-router-dom';
import { AnalyticsProvider } from './AnalyticsProvider';

const AnalyticsWrapper = ({ children }) => {
  // This component will only render if useLocation works (i.e., Router context is available)
  const location = useLocation();
  
  return (
    <AnalyticsProvider location={location}>
      {children}
    </AnalyticsProvider>
  );
};

export default AnalyticsWrapper;
