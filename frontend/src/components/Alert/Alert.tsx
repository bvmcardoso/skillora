import styles from './Alert.module.scss';
type Props = { message: string };
function Alert({ message }: Props) {
  return <div className={styles.alert}>{message}</div>;
}

export default Alert;
