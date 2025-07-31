import React from 'react';
import useOnlineStatus from '../hooks/useOnlineStatus';
import OfflinePage from './OfflinePage';

const OfflineWrapper = ({ children }) => {
  const isOnline = useOnlineStatus();

  // Show offline page when user is offline
  if (!isOnline) {
    return <OfflinePage />;
  }

  return children;
};

export default OfflineWrapper; 