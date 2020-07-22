import { Line } from 'react-chartjs-2';

type Props = {
  label: string;
  labels: string[];
  data: number[];
};

function LineChart({ label, labels, data }: Props) {
  return <Line data={{ labels, datasets: [{ label, data }] }} />;
}

export default LineChart;
