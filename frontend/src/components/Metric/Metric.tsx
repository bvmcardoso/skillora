import styles from './Metric.module.scss';

type Props = {
  label: string;
  value: string | number;
};

export default function Metric({ label, value }: Props) {
  return (
    <div className={styles.metric}>
      <div className={styles.metric__label}>{label}</div>
      <div className={styles.metric__value}>{value}</div>
    </div>
  );
}
