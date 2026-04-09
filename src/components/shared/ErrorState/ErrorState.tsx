import { AlertCircle } from 'lucide-react';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.wrapper} role="alert">
      <AlertCircle size={32} className={styles.icon} />
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
