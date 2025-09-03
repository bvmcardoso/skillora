import { useState } from 'react';
import styles from './ColumnMapForm.module.scss';
import { mapColumns, type ColumnMap } from '../../lib/api';
import toast from 'react-hot-toast';

type Props = {
  fileId: string;
  onMapped: (taskId: string) => void;
};

/** Default mapping aligned with CSV */
const DEFAULT_MAP: ColumnMap = {
  title: 'job_title',
  salary: 'compensation',
  currency: 'currency',
  country: 'country',
  seniority: 'seniority',
  stack: 'stack',
};

const FIELDS = ['title', 'salary', 'currency', 'country', 'seniority', 'stack'] as const;

function ColumnMapForm({ fileId, onMapped }: Props) {
  const [map, setMap] = useState<ColumnMap>(DEFAULT_MAP);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onChange(key: keyof ColumnMap, val: string) {
    setMap((m) => ({ ...m, [key]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      toast.loading('Processing...');
      const resp = await mapColumns(fileId, map);
      onMapped(resp.taskId); // normalized camelCase
    } catch (err: any) {
      setError(err?.message || 'Failed to map columns');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.mapForm}>
      <div className={styles.mapForm__head}>
        <h3 className={styles.mapForm__title}>Column Mapping</h3>
        <p className={styles.mapForm__hint}>Use the exact column names from your CSV</p>
      </div>

      <form onSubmit={onSubmit} className={styles.mapForm__form}>
        <div className={styles.mapForm__tableWrap}>
          <table className={styles.mapForm__table}>
            <thead>
              <tr>
                <th>Field</th>
                <th>CSV column</th>
              </tr>
            </thead>
            <tbody>
              {FIELDS.map((k) => (
                <tr key={k}>
                  <td className={styles.mapForm__field}>{k}</td>
                  <td>
                    <input
                      className={styles.mapForm__input}
                      type="text"
                      value={map[k]}
                      onChange={(e) => onChange(k, e.target.value)}
                      placeholder={`CSV column for ${k}`}
                      required
                      disabled={loading}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.mapForm__actions}>
          <button className={styles.mapForm__submit} type="submit" disabled={loading}>
            {loading ? 'Starting…' : 'Map and process'}
          </button>
          {error && <div className={styles.mapForm__error}>{error}</div>}
        </div>
      </form>
    </div>
  );
}

export default ColumnMapForm;
