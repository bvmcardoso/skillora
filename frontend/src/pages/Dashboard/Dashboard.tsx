import { useEffect, useState, useMemo } from 'react';
import styles from './Dashboard.module.scss';
import Metric from '../../components/Metric/Metric';
import {
  salarySummary,
  stackCompare,
  type SalarySummary,
  type StackCompareRow,
} from '../../lib/api';
import { fmtInt, fmtNumber } from '../../lib/format';

const PAGE_SIZES = [10, 25, 50, 100];

function Dashboard() {
  const [summary, setSummary] = useState<SalarySummary | null>(null);
  const [stacks, setStacks] = useState<StackCompareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    Promise.all([salarySummary(ctrl.signal), stackCompare(ctrl.signal)])
      .then(([s, rows]) => {
        setSummary(s);
        setStacks(Array.isArray(rows) ? rows : []);
      })
      .catch((e: any) => {
        if (e?.name === 'AbortError') return;
        setError(e?.message || 'Failed to load analytics');
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, []);

  // reset to first page when data or pageSize changes
  useEffect(() => {
    setPage(1);
  }, [stacks, pageSize]);

  const total = stacks.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const endIdx = Math.min(total, startIdx + pageSize);

  const pageRows = useMemo(() => stacks.slice(startIdx, endIdx), [stacks, startIdx, endIdx]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className={styles.dashboard}>
      <h2>Analytics</h2>

      {!loading && !error && (
        <>
          <section className={styles.metrics} aria-label="Summary metrics">
            <Metric label="p50" value={summary ? fmtNumber(summary.p50, 0) : '-'} />
            <Metric label="p75" value={summary ? fmtNumber(summary.p75, 0) : '-'} />
            <Metric label="p90" value={summary ? fmtNumber(summary.p90, 0) : '-'} />
            <Metric label="n" value={summary ? fmtInt(summary.n) : '-'} />
          </section>

          <section className={styles.tableSection} aria-label="Stack comparison">
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
                  {pageRows.map((r, i) => (
                    <tr key={`${r.stack}-${startIdx + i}`}>
                      <td>{r.stack}</td>
                      <td>{fmtNumber(r.p50, 0)}</td>
                      <td>{fmtInt(r.n)}</td>
                    </tr>
                  ))}

                  {total === 0 && (
                    <tr>
                      <td colSpan={3} className={styles.table__empty}>
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* footer: pagination */}
            {total > 0 && (
              <div className={styles.pager}>
                <div className={styles.pager__stats}>
                  Showing <strong>{fmtInt(total === 0 ? 0 : startIdx + 1)}</strong>–
                  <strong>{fmtInt(endIdx)}</strong> of <strong>{fmtInt(total)}</strong>
                </div>

                <div className={styles.pager__controls}>
                  <button
                    type="button"
                    className={styles.pager__btn}
                    onClick={() => canPrev && setPage((p) => Math.max(1, p - 1))}
                    disabled={!canPrev}
                    aria-label="Previous page"
                  >
                    ‹ Prev
                  </button>

                  <span className={styles.pager__page}>
                    Page {page} / {totalPages}
                  </span>

                  <button
                    type="button"
                    className={styles.pager__btn}
                    onClick={() => canNext && setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={!canNext}
                    aria-label="Next page"
                  >
                    Next ›
                  </button>

                  <label className={styles.pager__size}>
                    Rows per page
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                      {PAGE_SIZES.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
