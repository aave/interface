import { TransactionHistoryItem } from './types';

export const unixTimestampToFormattedTime = ({ unixTimestamp }: { unixTimestamp: number }) => {
  const date = new Date(unixTimestamp * 1000);
  const hours24 = date.getHours();
  const hours12 = ((hours24 + 24 - 1) % 12) + 1; // Convert to 12-hour format
  const minutes = date.getMinutes();
  const amOrPm = hours24 < 12 ? 'AM' : 'PM';

  const formattedHours = String(hours12).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
};

export const downloadData = (fileName: string, content: string, mimeType: string) => {
  const file = new Blob([content], { type: mimeType });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
};

export const groupByDate = (
  transactions: TransactionHistoryItem[]
): Record<string, TransactionHistoryItem[]> => {
  return transactions.reduce((grouped, transaction) => {
    const date = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(transaction.timestamp * 1000));
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transaction);
    return grouped;
  }, {} as Record<string, TransactionHistoryItem[]>);
};
