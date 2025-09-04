import { useState } from 'react';
import styles from './FileUpload.module.scss';
import { uploadFile } from '../../lib/api';
import FileUploadButton from '../FileUploadButton/FileUploadButton';
import toast from 'react-hot-toast';

type Props = { onUploaded: (fileId: string) => void };

const pickFileId = (resp: unknown): string | null => {
  if (!resp || typeof resp !== 'object') return null;

  const obj = resp as Record<string, unknown>;

  // direct keys
  if (typeof obj['file_id'] === 'string') return obj['file_id'];
  if (typeof obj['fileId'] === 'string') return obj['fileId'];
  if (typeof obj['id'] === 'string') return obj['id'];

  // nested: result.file_id
  const result = obj['result'];
  if (
    result &&
    typeof result === 'object' &&
    typeof (result as Record<string, unknown>)['file_id'] === 'string'
  ) {
    return (result as Record<string, unknown>)['file_id'] as string;
  }

  // nested: data.file_id
  const data = obj['data'];
  if (
    data &&
    typeof data === 'object' &&
    typeof (data as Record<string, unknown>)['file_id'] === 'string'
  ) {
    return (data as Record<string, unknown>)['file_id'] as string;
  }

  return null;
};

function FileUpload({ onUploaded }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    toast.loading('Upload started');

    try {
      const resp = await uploadFile(file);
      const id = pickFileId(resp);
      if (!id) {
        toast.error('Upload succeeded, but file_id not found in response.');
        return;
      }
      onUploaded(id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err?.message || 'Upload failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.fileUpload}>
      <FileUploadButton
        onChange={handleChange}
        accept=".csv,.xls,.xlsx"
        disabled={loading}
        buttonType="upload"
      >
        Upload file
      </FileUploadButton>
    </div>
  );
}

export default FileUpload;
