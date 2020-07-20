import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <script src="https://static.line-scdn.net/liff/edge/2.1/sdk.js"></script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
