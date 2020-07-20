import { useState, useEffect } from 'react';
import { liff } from '../lib/liff';

type Props = {
  liffId: string;
};

function useLiff({ liffId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initLiff = async ({ liffId }: { liffId: string }) => {
    setLoading(true);
    try {
      await liff.init({ liffId });
      console.log('success liff init');
      if (liff.isLoggedIn()) {
        console.log('logged in!');
      } else {
        console.log('not logged in');
        liff.login();
      }
    } catch (error) {
      console.log({ error });
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (process.browser && liffId) initLiff({ liffId });
  }, [liffId]);

  return { loading, error };
}

export default useLiff;
