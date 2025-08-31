import { useState } from 'react';
import styles from './FileUpload.module.scss';
import { uploadFile } from '../../lib/api';
import Spinner from '../Spinner/Spinner';
import Alert from '../Alert/Alert';

type Props = { onUploaded: (fileId: string) => void };

function pickFileId(resp: any): string | null {
  if (!resp || typeof resp !== 'object') return null;
  return (
    resp.file_id ?? resp.fileId ?? resp.id ?? resp.result?.file_id ?? resp.data?.file_id ?? null
  );
}

export default function FileUpload({ onUploaded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const resp = await uploadFile(file);
      console.log('[upload resp]', resp);
      const id = pickFileId(resp);
      if (!id) {
        setError('Upload succeeded, but file_id not found in response.');
        return;
      }
      onUploaded(id);
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.fileUpload}>
      <label>
        <input type="file" accept=".csv,.xlsx" onChange={handleChange} disabled={loading} />
      </label>

      {loading && <Spinner />}
      {error && <Alert message={error} />}
    </div>
  );
}
