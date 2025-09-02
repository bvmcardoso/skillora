import { useEffect, useMemo, useState } from 'react';
import styles from './TaskStatus.module.scss';
import { taskStatus, type TaskStatusResp } from '../../lib/api';
import { poll } from '../../lib/poll';

type Props = { taskId: string };

function TaskStatus({ taskId }: Props) {
  const [data, setData] = useState<TaskStatusResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable human label for UI
  const label = useMemo(() => {
    const s = data?.status ?? 'PENDING';
    if (s === 'PENDING') return 'Queued';
    if (s === 'RUNNING') return 'Processing';
    if (s === 'SUCCESS') return 'Finished';
    if (s === 'FAILURE') return 'Failed';
    return s;
  }, [data?.status]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    poll<TaskStatusResp>({
      fn: () => taskStatus(taskId, ctrl.signal),
      intervalMs: 1500,
      maxMs: 120_000,
      shouldStop: (r) => r.status === 'SUCCESS' || r.status === 'FAILURE',
      signal: ctrl.signal,
    })
      .then((r) => setData(r))
      .catch((e) => {
        if (e?.name === 'AbortError') return;
        setError(e?.message || 'Error fetching status');
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [taskId]);

  return (
    <div className={styles.status} aria-live="polite">
      <h3 className={styles.status__title}>Task status</h3>

      <div className={styles.status__card}>
        <div className={styles.status__row}>
          <span className={styles.status__label}>Task ID</span>
          <span className={styles.status__value}>{taskId}</span>
        </div>

        <div className={styles.status__row}>
          <span className={styles.status__label}>Status</span>
          <span className={styles.status__badge} data-state={data?.status || 'PENDING'}>
            {label}
          </span>
        </div>

        {typeof data?.progress === 'number' && (
          <div className={styles.status__row}>
            <span className={styles.status__label}>Progress</span>
            <span className={styles.status__value}>{Math.round(data.progress)}%</span>
          </div>
        )}

        {data?.status === 'FAILURE' && data?.message && (
          <div className={styles.status__row}>
            <span className={styles.status__label}>Message</span>
            <span className={styles.status__value}>{data.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskStatus;
