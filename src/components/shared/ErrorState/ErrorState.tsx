import { AlertCircle } from 'lucide-react';
import styles from './ErrorState.module.css';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Ocorreu um erro.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.wrapper} role="alert">
      <AlertCircle size={32} className={styles.icon} />
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryBtn} onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  );
}
