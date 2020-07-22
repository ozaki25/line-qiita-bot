import dayjs from 'dayjs';
import Layout from '../../components/Layout';
import { userApi } from '../../api/index';

type Props = {
  likeCountList: { total: number }[];
};

function Graph({ likeCountList }: Props) {
  console.log({ likeCountList });
  return (
    <Layout title="Graph">
      <h1>Hello</h1>
    </Layout>
  );
}

export async function getStaticProps({ lineId }: { lineId: string }) {
  const today = dayjs();
  const start = today.subtract(7, 'day').format('YYYY-MM-DD');
  const end = today.subtract(1, 'day').format('YYYY-MM-DD');
  const likeCountList = await userApi.getLikeCount(lineId, start, end);
  return { props: { likeCountList } };
}

export async function getStaticPaths() {
  const users = await userApi.getUsers();
  const paths = users.map(({ lineId }) => `/graph/${lineId}`);
  return { paths, fallback: false };
}

export default Graph;
