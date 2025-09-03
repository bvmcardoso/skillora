import { useEffect, useRef, useState } from 'react';
import styles from './TaskStatus.module.scss';
import { taskStatus, type TaskStatusResp } from '../../lib/api';
import toast from 'react-hot-toast';

type Props = { taskId: string };

const POLL_MS = 1200;

export default function TaskStatus({ taskId }: Props) {
  const [s, setS] = useState<TaskStatusResp | null>(null);
  const timer = useRef<number | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const next = await taskStatus(taskId);
        if (!cancelled) {
          setS(next);
          if (!next.ready) {
            timer.current = window.setTimeout(tick, POLL_MS);
          }
        }
      } catch {
        timer.current = window.setTimeout(tick, POLL_MS);
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [taskId]);

  useEffect(() => {
    if (!s?.ready || firedRef.current) return;
    firedRef.current = true;

    const toastId = `task:${s.id}`;
    if (s.successful) {
      toast.success('Processing finished successfully!', { id: toastId });
    } else {
      toast.error('Processing failed. Check logs for details.', { id: toastId });
    }
  }, [s?.ready, s?.successful, s?.id]);

  if (!s) return null;

  const percent =
    typeof s.meta?.percent === 'number'
      ? Math.max(0, Math.min(100, Math.round(s.meta.percent)))
      : undefined;

  return (
    <section className={styles.status}>
      <h3 className={styles.status__title}>Task status</h3>

      <div className={styles.status__card}>
        <div className={styles.status__row}>
          <span className={styles.status__label}>Task ID</span>
          <span className={styles.status__value}>{s.id}</span>
        </div>

        <div className={styles.status__row}>
          <span className={styles.status__label}>State</span>
          <span className={styles.status__value}>
            <span className={styles.status__badge} data-state={s.state}>
              {s.state}
            </span>
          </span>
        </div>

        {typeof percent === 'number' && (
          <div className={styles.status__row}>
            <span className={styles.status__label}>Progress</span>
            <div className={styles.status__value}>
              <div
                className={styles.status__progress}
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className={styles.status__progressFill} style={{ width: `${percent}%` }} />
              </div>
              {s.meta?.processed != null && s.meta?.total != null && (
                <div className={styles.status__value} aria-live="polite">
                  {s.meta.processed.toLocaleString()} / {s.meta.total.toLocaleString()} ({percent}%)
                </div>
              )}
            </div>
          </div>
        )}

        {s.ready && (
          <div className={styles.status__row}>
            <span className={styles.status__label}>Result</span>
            <span className={styles.status__value}>{s.successful ? 'SUCCESS' : 'FAILURE'}</span>
          </div>
        )}
      </div>
    </section>
  );
}
