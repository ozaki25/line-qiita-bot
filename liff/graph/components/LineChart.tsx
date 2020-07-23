import { Line } from 'react-chartjs-2';

type Props = {
  label: string;
  labels: string[];
  data: number[];
};

function LineChart({ label, labels, data }: Props) {
  return (
    <Line
      data={{ labels, datasets: [{ label, data, lineTension: 0 }] }}
      options={{
        animation: {
          duration: 0,
        },
        hover: {
          animationDuration: 0,
        },
        responsiveAnimationDuration: 0,
      }}
    />
  );
}

export default LineChart;
