import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:5174');
  
  // Wait for React to mount
  await page.waitForTimeout(2000);

  // Click Data Import
  await page.click('text=Data Import');
  await page.waitForTimeout(1000);

  // Upload files
  const fileInput = await page.$('input[type=file]');
  await fileInput.setInputFiles([
    'c:/Users/sanji/OneDrive/Desktop/test_client_grid.csv',
    'c:/Users/sanji/OneDrive/Desktop/test_client_sellout.csv'
  ]);

  await page.waitForTimeout(2000);

  // Click Dashboard
  await page.click('text=Dashboard');
  await page.waitForTimeout(2000);
  
  await browser.close();
})();
