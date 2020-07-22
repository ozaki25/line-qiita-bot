import dayjs from 'dayjs';
import Layout from '../../components/Layout';
import { userApi } from '../../api/index';
import LineChart from '../../components/LineChart';

type Props = {
  likeCountList: { total: number; date: string }[];
};

function Graph({ likeCountList }: Props) {
  console.log({ likeCountList });
  const labels = likeCountList.map(({ date }) => date);
  const data = likeCountList.map(({ total }) => total);
  return (
    <Layout title="Graph">
      <LineChart label="合計いいね数" labels={labels} data={data} />
    </Layout>
  );
}

type GetStaticPropsProps = {
  params: { lineId: string };
};

export async function getStaticProps({ params }: GetStaticPropsProps) {
  const today = dayjs();
  const start = today.subtract(7, 'day').format('YYYY-MM-DD');
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
