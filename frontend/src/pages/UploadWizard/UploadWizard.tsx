import { useState } from 'react';
import styles from './UploadWizard.module.scss';
import FileUpload from '../../components/FileUpload/FileUpload';
import ColumnMapForm from '../../components/ColumnMapForm/ColumnMapForm';
import TaskStatus from '../../components/TaskStatus/TaskStatus';

export default function UploadWizard() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  return (
    <div className={styles.uploadWizard}>
      <h2>Upload Wizard</h2>

      {!fileId && <FileUpload onUploaded={setFileId} />}

      {fileId && (
        <div>
          <strong>file_id:</strong> {fileId}
        </div>
      )}

      {fileId && !taskId && <ColumnMapForm fileId={fileId} onMapped={setTaskId} />}

      {taskId && <TaskStatus taskId={taskId} />}
    </div>
  );
}
