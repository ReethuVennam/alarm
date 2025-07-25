import { Timer, formatDuration } from '@/hooks/useTimers';
import { format as formatDate } from 'date-fns';

export interface TimerExportData {
  name: string;
  category: string;
  originalDuration: number;
  remainingTime: number;
  color: string;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: number;
}

export function exportTimerToJSON(timer: Timer): string {
  const exportData: TimerExportData = {
    name: timer.name,
    category: timer.category,
    originalDuration: timer.originalDuration,
    remainingTime: timer.remainingTime,
    color: timer.color,
    isRunning: timer.isRunning,
    isPaused: timer.isPaused,
    isCompleted: timer.isCompleted,
    createdAt: formatDate(timer.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    startedAt: timer.startedAt ? formatDate(timer.startedAt, 'yyyy-MM-dd HH:mm:ss') : undefined,
    completedAt: timer.completedAt ? formatDate(timer.completedAt, 'yyyy-MM-dd HH:mm:ss') : undefined,
    progress: Math.round(((timer.originalDuration - timer.remainingTime) / timer.originalDuration) * 100)
  };

  return JSON.stringify(exportData, null, 2);
}

export function exportTimerToCSV(timer: Timer): string {
  const headers = [
    'Name',
    'Category', 
    'Original Duration (min)',
    'Remaining Time (min)',
    'Color',
    'Status',
    'Progress (%)',
    'Created At',
    'Started At',
    'Completed At'
  ];

  const status = timer.isCompleted ? 'Completed' :
                timer.isRunning ? 'Running' :
                timer.isPaused ? 'Paused' : 'Ready';

  const row = [
    `"${timer.name}"`,
    `"${timer.category}"`,
    Math.round(timer.originalDuration / 60),
    Math.round(timer.remainingTime / 60),
    timer.color,
    status,
    Math.round(((timer.originalDuration - timer.remainingTime) / timer.originalDuration) * 100),
    formatDate(timer.createdAt, 'yyyy-MM-dd HH:mm:ss'),
    timer.startedAt ? formatDate(timer.startedAt, 'yyyy-MM-dd HH:mm:ss') : '',
    timer.completedAt ? formatDate(timer.completedAt, 'yyyy-MM-dd HH:mm:ss') : ''
  ];

  return [headers.join(','), row.join(',')].join('\n');
}

export function downloadTimerData(timer: Timer, format: 'json' | 'csv' = 'json'): void {
  const data = format === 'json' ? exportTimerToJSON(timer) : exportTimerToCSV(timer);
  const mimeType = format === 'json' ? 'application/json' : 'text/csv';
  const filename = `timer-${timer.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${Date.now()}.${format}`;

  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function shareTimer(timer: Timer): Promise<void> {
  const shareData = {
    title: `Timer: ${timer.name}`,
    text: generateShareText(timer),
    url: window.location.href
  };

  // Check if Web Share API is supported
  if (navigator.share && navigator.canShare?.(shareData)) {
    return navigator.share(shareData);
  } else {
    // Fallback to clipboard
    return copyToClipboard(shareData.text);
  }
}

export function generateShareText(timer: Timer): string {
  const progress = Math.round(((timer.originalDuration - timer.remainingTime) / timer.originalDuration) * 100);
  const status = timer.isCompleted ? 'Completed!' :
                timer.isRunning ? 'Currently running' :
                timer.isPaused ? 'Paused' : 'Ready to start';

  const duration = formatDuration(timer.originalDuration);
  const remaining = formatDuration(timer.remainingTime);

  return `🔥 Timer: ${timer.name}
📊 Category: ${timer.category}
⏱️ Duration: ${duration}
⏳ Remaining: ${remaining}
📈 Progress: ${progress}%
🎯 Status: ${status}

Created with Smart Alarm Timer App`;
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    return new Promise((resolve, reject) => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          resolve();
        } else {
          reject(new Error('Copy command failed'));
        }
      } catch (err) {
        document.body.removeChild(textArea);
        reject(err);
      }
    });
  }
}

export function exportMultipleTimers(timers: Timer[], format: 'json' | 'csv' = 'json'): void {
  if (format === 'json') {
    const data = timers.map(timer => {
      const exportData: TimerExportData = {
        name: timer.name,
        category: timer.category,
        originalDuration: timer.originalDuration,
        remainingTime: timer.remainingTime,
        color: timer.color,
        isRunning: timer.isRunning,
        isPaused: timer.isPaused,
        isCompleted: timer.isCompleted,
        createdAt: formatDate(timer.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        startedAt: timer.startedAt ? formatDate(timer.startedAt, 'yyyy-MM-dd HH:mm:ss') : undefined,
        completedAt: timer.completedAt ? formatDate(timer.completedAt, 'yyyy-MM-dd HH:mm:ss') : undefined,
        progress: Math.round(((timer.originalDuration - timer.remainingTime) / timer.originalDuration) * 100)
      };
      return exportData;
    });

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `timers-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // CSV format
    const headers = [
      'Name',
      'Category', 
      'Original Duration (min)',
      'Remaining Time (min)',
      'Color',
      'Status',
      'Progress (%)',
      'Created At',
      'Started At',
      'Completed At'
    ];

    const rows = timers.map(timer => {
      const status = timer.isCompleted ? 'Completed' :
                    timer.isRunning ? 'Running' :
                    timer.isPaused ? 'Paused' : 'Ready';

      return [
        `"${timer.name}"`,
        `"${timer.category}"`,
        Math.round(timer.originalDuration / 60),
        Math.round(timer.remainingTime / 60),
        timer.color,
        status,
        Math.round(((timer.originalDuration - timer.remainingTime) / timer.originalDuration) * 100),
        formatDate(timer.createdAt, 'yyyy-MM-dd HH:mm:ss'),
        timer.startedAt ? formatDate(timer.startedAt, 'yyyy-MM-dd HH:mm:ss') : '',
        timer.completedAt ? formatDate(timer.completedAt, 'yyyy-MM-dd HH:mm:ss') : ''
      ].join(',');
    });

    const csvData = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `timers-export-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}