import styles from './LoadingState.module.css';

export function LoadingState() {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
    </div>
  );
}
