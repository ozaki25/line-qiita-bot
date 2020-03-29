import React from 'react';
import { ThemeProvider } from '@chakra-ui/core';

import useLiff from './hooks/useLiff';

const liffId: string = process.env.LIFF_ID || '';

function App() {
  const { loading, error, profile } = useLiff({ liffId });
  if (loading) return <p>...loading</p>;
  if (error) return <p>{error}</p>;

  const lineId = profile?.userId;

  return (
    <ThemeProvider>
      <h1>Hello LIFF</h1>
      <p>{lineId}</p>
    </ThemeProvider>
  );
}

export default App;
