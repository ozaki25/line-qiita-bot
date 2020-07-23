import { Line } from 'react-chartjs-2';

type Props = {
  label: string;
  labels: string[];
  data: number[];
};

function LineChart({ label, labels, data }: Props) {
  return (
    <Line
      data={{
        labels,
        datasets: [{ label, data, lineTension: 0, spanGaps: false }],
      }}
      options={{
        animation: {
          duration: 0,
        },
        hover: {
          animationDuration: 0,
        },
        responsiveAnimationDuration: 0,
        scales: {
          yAxes: [{ ticks: { precision: 0 } }],
        },
      }}
    />
  );
}

export default LineChart;
