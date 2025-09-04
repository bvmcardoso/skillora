import { useEffect, useRef, useState } from 'react';
import styles from './TaskStatus.module.scss';
import { taskStatus, type TaskStatusResp } from '../../lib/api';
import toast from 'react-hot-toast';

type Props = { taskId: string };

const POLL_MS = 1200;

export default function TaskStatus({ taskId }: Props) {
  const [s, setS] = useState<TaskStatusResp | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const loadingTimerRef = useRef<number | null>(null);
  const loadingShownRef = useRef(false);
  const finishedRef = useRef(false); // garante que não dispara duas vezes

  useEffect(() => {
    let cancelled = false;

    // Schedule "Processing…" if time takes more than 800ms
    if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
    loadingShownRef.current = false;
    finishedRef.current = false;

    loadingTimerRef.current = window.setTimeout(() => {
      toast.loading('Processing…', { id: `task:${taskId}` });
      loadingShownRef.current = true;
    }, 800);

    const tick = async () => {
      try {
        const next = await taskStatus(taskId);
        if (!cancelled) {
          setS(next);
          if (!next.ready) {
            pollTimerRef.current = window.setTimeout(tick, POLL_MS);
          }
        }
      } catch {
        pollTimerRef.current = window.setTimeout(tick, POLL_MS);
      }
    };

    tick();
    return () => {
      cancelled = true;
      if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current);
      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
    };
  }, [taskId]);

  useEffect(() => {
    if (!s?.ready || finishedRef.current) return;
    finishedRef.current = true;

    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }

    const toastId = `task:${s.id}`;
    if (s.successful) {
      toast.success('Processing finished successfully!', {
        id: toastId,
        duration: 2000,
      });
    } else {
      toast.error('Processing failed. Check logs for details.', {
        id: toastId,
        duration: 7000,
      });
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
