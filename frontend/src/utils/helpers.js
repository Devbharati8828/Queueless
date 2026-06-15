export function formatTime(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

export function formatTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

export function getQueueProgress(current, total) {
  if (total === 0) return 100;
  return Math.round((current / total) * 100);
}

export function getEstimatedWait(position, avgWaitTime) {
  return position * avgWaitTime;
}

export function getStatusInfo(status) {
  switch (status) {
    case 'serving':
      return { label: 'Now Serving', className: 'badge-active', color: '#34d399' };
    case 'next':
      return { label: 'You\'re Next!', className: 'badge-waiting', color: '#fbbf24' };
    case 'waiting':
      return { label: 'In Queue', className: 'badge-waiting', color: '#fbbf24' };
    case 'completed':
      return { label: 'Completed', className: 'badge-active', color: '#34d399' };
    case 'active':
      return { label: 'Active', className: 'badge-active', color: '#34d399' };
    case 'paused':
      return { label: 'Paused', className: 'badge-closed', color: '#fb7185' };
    default:
      return { label: status, className: 'badge-waiting', color: '#94a3b8' };
  }
}

export function generateQueueCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
