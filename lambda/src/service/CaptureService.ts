import { Lambda } from 'aws-sdk';
import {
  args,
  defaultViewport,
  executablePath,
  headless,
  puppeteer,
} from 'chrome-aws-lambda';

const lambda = new Lambda();

const { GET_CAPTURE_FUNCTION } = process.env;

async function invoke({ url }) {
  try {
    const params = {
      FunctionName: GET_CAPTURE_FUNCTION,
      InvocationType: 'RequestResponse',
      Payload: JSON.stringify({ url }),
    };
    console.log({ params });
    return await lambda.invoke(params).promise();
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function excute({ url }) {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args,
      defaultViewport,
      executablePath: await executablePath,
      headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.setViewport({
      width: 800,
      height: 100,
      deviceScaleFactor: 1,
    });
    await page.goto(url);
    return await page.screenshot();
  } catch (error) {
    console.log(error);
    return null;
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}

export const captureService = {
  invoke,
  excute,
};
