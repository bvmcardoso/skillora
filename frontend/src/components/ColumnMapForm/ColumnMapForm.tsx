import { useState } from 'react';
import styles from './ColumnMapForm.module.scss';
import { mapColumns, type ColumnMap } from '../../lib/api';
import Spinner from '../Spinner/Spinner';
import Alert from '../Alert/Alert';

type Props = {
  fileId: string;
  onMapped: (taskId: string) => void;
};

const PRESET_GENERIC: ColumnMap = {
  title: 'title',
  salary: 'salary',
  currency: 'currency',
  country: 'country',
  seniority: 'seniority',
  stack: 'stack',
};

const PRESET_SCRAPED: ColumnMap = {
  title: 'job_title',
  salary: 'compensation',
  currency: 'currency',
  country: 'country',
  seniority: 'seniority',
  stack: 'stack',
};

export default function ColumnMapForm({ fileId, onMapped }: Props) {
  const [map, setMap] = useState<ColumnMap>(PRESET_SCRAPED);
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
      const resp = await mapColumns(fileId, map);
      onMapped(resp.task_id);
    } catch (err: any) {
      setError(err.message || 'Failure on mapping columns');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.mapForm}>
      <div className={styles.mapForm__head}>
        <h3 className={styles.mapForm__title}>Column Mapping</h3>
        <div className={styles.mapForm__presets}>
          <button
            type="button"
            className={styles.mapForm__presetBtn}
            onClick={() => setMap(PRESET_GENERIC)}
            disabled={loading}
          >
            Use generic preset
          </button>
          <button
            type="button"
            className={styles.mapForm__presetBtn}
            onClick={() => setMap(PRESET_SCRAPED)}
            disabled={loading}
          >
            Use scraped preset
          </button>
        </div>
      </div>

      <form className={styles.mapForm__grid} onSubmit={onSubmit}>
        {(['title', 'salary', 'currency', 'country', 'seniority', 'stack'] as const).map((k) => (
          <div key={k} className={styles.mapForm__row}>
            <label className={styles.mapForm__label}>{k}</label>
            <input
              className={styles.mapForm__input}
              type="text"
              value={map[k]}
              onChange={(e) => onChange(k, e.target.value)}
              placeholder={`csv column name to ${k}`}
              required
              disabled={loading}
            />
          </div>
        ))}

        <div className={styles.mapForm__actions}>
          <button className={styles.mapForm__submit} type="submit" disabled={loading}>
            Map and process
          </button>
        </div>
      </form>

      {loading && <Spinner />}
      {error && <Alert message={error} />}
    </div>
  );
}
