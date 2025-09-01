import { useState } from 'react';
import styles from './UploadWizard.module.scss';
import FileUpload from '../../components/FileUpload/FileUpload';
import ColumnMapForm from '../../components/ColumnMapForm/ColumnMapForm';
import TaskStatus from '../../components/TaskStatus/TaskStatus';

function UploadWizard() {
  const [fileId, setFileId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  return (
    <div className={styles.uploadWizard}>
      <h2>Upload Wizard</h2>
      <div className={styles.uploadWizard__fileUpload}>
        {!fileId && <FileUpload onUploaded={setFileId} />}

        {fileId && (
          <div>
            <strong>File ID:</strong> {fileId}
          </div>
        )}
      </div>

      <hr />

      <div className={styles.uploadWizard__columnMap}>
        {fileId && !taskId && <ColumnMapForm fileId={fileId} onMapped={setTaskId} />}
      </div>
      <div className="uploadWizard__taskStatus">{taskId && <TaskStatus taskId={taskId} />}</div>
    </div>
  );
}

export default UploadWizard;
