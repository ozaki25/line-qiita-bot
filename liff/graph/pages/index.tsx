import { useEffect } from 'react';
import Router from 'next/router';
import Layout from '../components/Layout';
import useLiff from '../hooks/useLiff';

type Props = {
  liffId: string;
};

function Top({ liffId }: Props) {
  const { loading, error, profile } = useLiff({ liffId });

  useEffect(() => {
    if (profile) Router.replace(`/graph/${profile.userId}`);
  }, [profile]);

  return (
    <Layout title="Hello">
      {loading && <p>...loading</p>}
      {error && <p>{error}</p>}
    </Layout>
  );
}

export async function getStaticProps() {
  const liffId: string = process.env.REACT_APP_LIFF_ID || '';
  return { props: { liffId } };
}

export default Top;
