import styles from './LoadingState.module.css';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Carregando…' }: LoadingStateProps) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
