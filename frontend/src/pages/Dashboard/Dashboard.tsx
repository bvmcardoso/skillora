import { useEffect, useState } from 'react';
import styles from './Dashboard.module.scss';
import Metric from '../../components/Metric/Metric';
import Spinner from '../../components/Spinner/Spinner';
import Alert from '../../components/Alert/Alert';
import {
  salarySummary,
  stackCompare,
  type SalarySummary,
  type StackCompareRow,
} from '../../lib/api';
import { fmtInt, fmtNumber } from '../../lib/format';

export default function Dashboard() {
  const [summary, setSummary] = useState<SalarySummary | null>(null);
  const [stacks, setStacks] = useState<StackCompareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ cria um controller NOVO por execução do efeito
    const ctrl = new AbortController();
    const { signal } = ctrl;

    setLoading(true);
    setError(null);

    Promise.all([salarySummary(signal), stackCompare(signal)])
      .then(([s, c]) => {
        setSummary(s);
        setStacks(c);
      })
      .catch((e: any) => {
        if (e?.name === 'AbortError') return;
        setError(e?.message || 'Failed to load analytics');
      })
      .finally(() => setLoading(false));

    // cleanup aborta apenas este ciclo
    return () => ctrl.abort();
  }, []);

  return (
    <div className={styles.dashboard}>
      <h2>Analytics</h2>

      {loading && <Spinner />}
      {error && <Alert message={error} />}

      {!loading && !error && (
        <>
          <section className={styles.metrics}>
            <Metric label="p50" value={summary ? fmtNumber(summary.p50, 0) : '-'} />
            <Metric label="p75" value={summary ? fmtNumber(summary.p75, 0) : '-'} />
            <Metric label="p90" value={summary ? fmtNumber(summary.p90, 0) : '-'} />
            <Metric label="n" value={summary ? fmtInt(summary.n) : '-'} />
          </section>

          <section className={styles.tableSection}>
            <h3 className={styles.tableSection__title}>Stack comparison (p50)</h3>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Stack</th>
                    <th>p50</th>
                    <th>n</th>
                  </tr>
                </thead>
                <tbody>
                  {stacks.map((r, i) => (
                    <tr key={`${r.stack}-${i}`}>
                      <td>{r.stack}</td>
                      <td>{fmtNumber(r.p50, 0)}</td>
                      <td>{fmtInt(r.n)}</td>
                    </tr>
                  ))}
                  {stacks.length === 0 && (
                    <tr>
                      <td colSpan={3} className={styles.table__empty}>
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
