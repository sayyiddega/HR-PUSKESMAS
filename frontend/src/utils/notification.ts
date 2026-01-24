// src/utils/notification.ts
export const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // This uses a custom event to trigger the NotificationToast component in App.tsx
  window.dispatchEvent(new CustomEvent('sikep_notify', { detail: message }));
  console.log(`Notification (${type}): ${message}`);
};
