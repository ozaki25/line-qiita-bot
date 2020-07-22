import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import Layout from '../../components/Layout';
import { userApi } from '../../api/index';
import LineChart from '../../components/LineChart';

type Props = {
  likeCountList: { total: number; date: string }[];
};

function Graph({ likeCountList }: Props) {
  console.log({ likeCountList });
  const [label, setLabel] = useState<string>('');
  const [labels, setLabels] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);

  const onClickByDay = () => {
    const label = '日別いいね数';
    const labels = likeCountList.map(({ date }) => date).slice(1);
    const data = likeCountList.reduce<number[]>((prev, { total }, i, list) => {
      return i === 0 ? [...prev] : [...prev, total - list[i - 1].total];
    }, []);
    setLabel(label);
    setLabels(labels);
    setData(data);
  };

  const onClickTotal = () => {
    const label = '合計いいね数';
    const labels = likeCountList.map(({ date }) => date);
    const data = likeCountList.map(({ total }) => total);
    setLabel(label);
    setLabels(labels);
    setData(data);
  };

  useEffect(() => {
    onClickByDay();
  }, []);

  return (
    <Layout title="Graph">
      <p>
        <button onClick={onClickByDay}>日別いいね数</button>
        <button onClick={onClickTotal}>合計いいね数</button>
      </p>
      <LineChart label={label} labels={labels} data={data} />
    </Layout>
  );
}

type GetStaticPropsProps = {
  params: { lineId: string };
};

export async function getStaticProps({ params }: GetStaticPropsProps) {
  const today = dayjs();
  const start = today.subtract(8, 'day').format('YYYY-MM-DD');
  const end = today.subtract(1, 'day').format('YYYY-MM-DD');
  const likeCountList = await userApi.getLikeCount(params.lineId, start, end);
  return { props: { likeCountList } };
}

export async function getStaticPaths() {
  const users = await userApi.getUsers();
  const paths = users.map(({ lineId }) => `/graph/${lineId}`);
  return { paths, fallback: false };
}

export default Graph;
