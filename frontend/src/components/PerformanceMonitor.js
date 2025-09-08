/**
 * Performance Monitoring Component
 */

import React, { useEffect, useState } from 'react';
import { Activity, Zap, Clock, Database, Wifi } from 'lucide-react';

const PerformanceMonitor = ({ showDetails = false }) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
    fps: 0,
    isOnline: navigator.onLine
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Monitor performance metrics
    const updateMetrics = () => {
      // Page load time
      if (performance.timing) {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }

      // Memory usage (if available)
      if (performance.memory) {
        const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }

      // Network status
      setMetrics(prev => ({ ...prev, isOnline: navigator.onLine }));

      // FPS monitoring
      let lastTime = performance.now();
      let frameCount = 0;
      
      const measureFPS = () => {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
          setMetrics(prev => ({ ...prev, fps: frameCount }));
          frameCount = 0;
          lastTime = currentTime;
        }
        
        requestAnimationFrame(measureFPS);
      };
      
      measureFPS();
    };

    // Initial metrics
    updateMetrics();

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    // Network status listener
    const handleOnline = () => setMetrics(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Measure component render time
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      setMetrics(prev => ({ ...prev, renderTime: endTime - startTime }));
    };
  }, []);

  const getPerformanceColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (value, thresholds) => {
    if (value <= thresholds.good) return '🟢';
    if (value <= thresholds.warning) return '🟡';
    return '🔴';
  };

  if (!isVisible && !showDetails) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        title="Show Performance Monitor"
      >
        <Activity className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50 min-w-64">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {/* Load Time */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Load Time
          </span>
          <span className={getPerformanceColor(metrics.loadTime, { good: 1000, warning: 3000 })}>
            {getPerformanceIcon(metrics.loadTime, { good: 1000, warning: 3000 })}
            {metrics.loadTime}ms
          </span>
        </div>

        {/* Memory Usage */}
        {metrics.memoryUsage > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Memory
            </span>
            <span className={getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 100 })}>
              {getPerformanceIcon(metrics.memoryUsage, { good: 50, warning: 100 })}
              {metrics.memoryUsage}MB
            </span>
          </div>
        )}

        {/* FPS */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            FPS
          </span>
          <span className={getPerformanceColor(60 - metrics.fps, { good: 10, warning: 20 })}>
            {getPerformanceIcon(60 - metrics.fps, { good: 10, warning: 20 })}
            {metrics.fps}
          </span>
        </div>

        {/* Network Status */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Wifi className="w-3 h-3" />
            Network
          </span>
          <span className={metrics.isOnline ? 'text-green-600' : 'text-red-600'}>
            {metrics.isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>

        {/* Render Time */}
        {showDetails && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Render</span>
            <span className={getPerformanceColor(metrics.renderTime, { good: 16, warning: 33 })}>
              {metrics.renderTime.toFixed(2)}ms
            </span>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-xs font-medium text-gray-900 dark:text-white mb-2">
            Performance Tips:
          </h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {metrics.loadTime > 3000 && (
              <li>• Consider optimizing images and assets</li>
            )}
            {metrics.memoryUsage > 100 && (
              <li>• High memory usage detected</li>
            )}
            {metrics.fps < 30 && (
              <li>• Low FPS - check for heavy animations</li>
            )}
            {!metrics.isOnline && (
              <li>• You're offline - some features may not work</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
