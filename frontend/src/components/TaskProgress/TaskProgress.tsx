import { useEffect, useRef, useState } from 'react';
import styles from './TaskProgress.module.scss';
import { taskStatus, type TaskStatusResp } from '../../lib/api';

type Props = {
  taskId: string;
  onFinish?: (s: TaskStatusResp) => void;
};

const POLL_MS = 1200;

export default function TaskProgress({ taskId, onFinish }: Props) {
  const [s, setS] = useState<TaskStatusResp | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      try {
        const next = await taskStatus(taskId);
        if (cancelled) return;
        setS(next);
        if (next.ready) {
          onFinish?.(next);
          return;
        }
      } catch {
        // intentionally empty
      }
      timer.current = window.setTimeout(tick, POLL_MS);
    };

    tick();
    return () => {
      cancelled = true;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [taskId, onFinish]);

  if (!s) return null;

  const p = s.meta?.percent;
  const percent = typeof p === 'number' ? Math.max(0, Math.min(100, Math.round(p))) : undefined;

  return (
    <div className={styles.progress} aria-live="polite">
      <span className={styles['progress__label']}>{s.state}</span>
      {typeof percent === 'number' && (
        <div className={styles['progress__bar']} aria-valuenow={percent} role="progressbar">
          <div className={styles['progress__fill']} style={{ width: `${percent}%` }} />
        </div>
      )}
      {s.meta?.processed != null && s.meta?.total != null && (
        <span className={styles['progress__count']}>
          {s.meta.processed.toLocaleString()} / {s.meta.total.toLocaleString()}
        </span>
      )}
    </div>
  );
}
