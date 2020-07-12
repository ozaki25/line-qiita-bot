import { Lambda, S3 } from 'aws-sdk';
import {
  args,
  defaultViewport,
  executablePath,
  headless,
  puppeteer,
} from 'chrome-aws-lambda';
import sharp from 'sharp';

const lambda = new Lambda();
const s3 = new S3();

const {
  AWS_REGION,
  CAPTURE_PAGE_URL,
  GET_CAPTURE_FUNCTION,
  S3_BUCKET,
} = process.env;

function getCapturePageUrl(
  name: string,
  contributions: {
    start: number | null;
    end: number | null;
    count: number;
  }[],
) {
  return `${CAPTURE_PAGE_URL}?q=${encodeURIComponent(
    JSON.stringify([{ name, contributions }]),
  )}`;
}

async function invoke(url: string) {
  try {
    const params = {
      FunctionName: GET_CAPTURE_FUNCTION || '',
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

async function excute(url: string) {
  const browser = await puppeteer.launch({
    args,
    defaultViewport,
    executablePath: await executablePath,
    headless,
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();
  await page.goto(url);
  return await page.screenshot({
    clip: {
      x: 110,
      y: 10,
      width: 574,
      height: 82,
    },
  });
}

async function getThumbnail(image: string) {
  return await sharp(image)
    .resize(250, 120, {
      fit: 'contain',
      background: '#b0bec5',
    })
    .toBuffer();
}

async function save(data: Buffer) {
  const name = `${Date.now()}.png`;
  const params = {
    ACL: 'public-read',
    Bucket: S3_BUCKET || '',
    Body: data,
    ContentType: 'image/png',
    Key: name,
  };
  console.log(params);
  await s3.putObject(params).promise();
  return `https://${S3_BUCKET}.s3-${AWS_REGION}.amazonaws.com/${name}`;
}

export const captureService = {
  invoke,
  excute,
  save,
  getCapturePageUrl,
  getThumbnail,
};
