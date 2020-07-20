import Layout from '../components/Layout';
import useLiff from '../hooks/useLiff';

type Props = {
  liffId: string;
};

function Top({ liffId }: Props) {
  const { loading, error } = useLiff({ liffId });
  console.log(loading, error);
  return (
    <Layout title="Hello">
      {loading ? <p>...loading</p> : <h1>Hello</h1>}
    </Layout>
  );
}

export async function getStaticProps() {
  const liffId: string = process.env.REACT_APP_LIFF_ID || '';
  return { props: { liffId } };
}

export default Top;
