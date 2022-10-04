const http = require('http');
const puppeteer = require('puppeteer-core');
const { JustBrowseTransport } = require('../build/index');

function get(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        const data = [];

        res.on('data', (chunk) => {
          data.push(chunk);
        });

        res.on('end', () =>
          resolve(JSON.parse(Buffer.concat(data).toString())),
        );
      })
      .on('error', (err) => reject(err));
  });
}

async function main() {
  const data = await get('http://127.0.0.1:3005/new?width=1024&height=768');

  const browser = await puppeteer.connect({
    transport: await JustBrowseTransport.create(data.url, data.id),
  });

  const page = await browser.newPage();
  console.log((await browser.pages()).length);
  await page.goto('https://httpbin.org/ip');

  console.log(await page.content());

  await browser.close();
}

main().catch(console.error);
