import { useState, useEffect } from 'react';
import { liff } from '../lib/liff';

type Props = {
  liffId: string;
};

type Profile = {
  userId: string;
  displayName: string;
  pictureUrl: string;
  statusMessage?: string;
};

function useLiff({ liffId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const initLiff = async ({ liffId }: { liffId: string }) => {
    setLoading(true);
    try {
      await liff.init({ liffId });
      console.log('success liff init');
      if (liff.isLoggedIn()) {
        console.log('logged in!');
        await fetchProfile();
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

  const fetchProfile = async () => {
    setLoading(true);
    try {
      setProfile(await liff.getProfile());
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

  return { loading, error, profile };
}

export default useLiff;
