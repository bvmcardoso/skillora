import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './TaskStatus.module.scss';
import { taskStatus, type TaskStatusResp } from '../../lib/api';
import { poll } from '../../lib/poll';
import Spinner from '../Spinner/Spinner';
import Alert from '../Alert/Alert';

type Props = { taskId: string };

export default function TaskStatus({ taskId }: Props) {
  const [data, setData] = useState<TaskStatusResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const ctrlRef = useRef<AbortController | null>(null);

  const label = useMemo(() => {
    if (!data) return 'Waiting...';
    if (data.status === 'PENDING') return 'Queued';
    if (data.status === 'RUNNING') return 'Processing';
    if (data.status === 'SUCCESS') return 'Finsihed';
    if (data.status === 'FAILURE') return 'Failed';
    return data.status;
  }, [data]);

  useEffect(() => {
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;
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
    <div className={styles.status}>
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

        {data?.message && (
          <div className={styles.status__row}>
            <span className={styles.status__label}>Message</span>
            <span className={styles.status__value}>{data.message}</span>
          </div>
        )}
      </div>

      {loading && <Spinner />}
      {error && <Alert message={error} />}
    </div>
  );
}
