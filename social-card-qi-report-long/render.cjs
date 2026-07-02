const path = require("path");
const { chromium } = require("playwright");

async function main() {
  const root = __dirname;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 3900 },
    deviceScaleFactor: 1,
  });

  await page.goto(`file://${path.join(root, "index.html")}`, {
    waitUntil: "networkidle",
  });
  await page.evaluate(() => document.fonts && document.fonts.ready);

  const node = page.locator("#long-qi-report");
  await node.screenshot({
    path: path.join(root, "output", "qi-360-report-long.png"),
  });

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
