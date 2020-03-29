import React, { useState, useEffect, ChangeEvent } from 'react';
import {
  ThemeProvider,
  Box,
  Input,
  Button,
  CSSReset,
  Text,
  useToast,
} from '@chakra-ui/core';
import useLiff from './hooks/useLiff';
import { userApi } from './api/UserApi';

const liffId: string = process.env.REACT_APP_LIFF_ID || '';

function App() {
  const [lineId, setLineId] = useState('');
  const [qiitaId, setQiitaId] = useState('');
  const [current, setCurrent] = useState<{
    lineId: string;
    qiitaId: string;
  } | null>(null);
  const { loading, error, profile } = useLiff({ liffId });
  console.log({ loading, error, profile, liffId, current });

  const successToast = useToast();
  const errorToast = useToast();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQiitaId(e.target.value);
  };

  const onSubmit = async () => {
    try {
      await userApi.postUser({ qiitaId, lineId });
      showSuccessToast('登録が完了しました');
    } catch (e) {
      showErrorToast('登録に失敗しました');
    }
  };

  const setupCurrentUser = async () => {
    const user = await userApi.getUser({ lineId });
    setCurrent(user);
  };

  const showSuccessToast = (description: string) => {
    successToast({
      description,
      status: 'success',
    });
  };

  const showErrorToast = (description: string) => {
    errorToast({
      description,
      status: 'error',
    });
  };

  useEffect(() => {
    if (profile) setLineId(profile.userId);
  }, [profile]);

  useEffect(() => {
    if (lineId) setupCurrentUser();
  }, [lineId]);

  if (loading) return <p>...loading</p>;
  if (error) return <p>{error}</p>;

  return (
    <ThemeProvider>
      <CSSReset />
      <Box p={4}>
        {current ? (
          <Text>登録済みのQiitaのID: {current.qiitaId}</Text>
        ) : (
          <Text>QiitaのIDを登録してください</Text>
        )}
        <Input mb={4} value={qiitaId} onChange={onChange} />
        <Button onClick={onSubmit} width="100%">
          登録
        </Button>
      </Box>
    </ThemeProvider>
  );
}

export default App;
