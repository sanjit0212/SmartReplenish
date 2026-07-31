import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:5174');
  
  await new Promise(r => setTimeout(r, 2000));

  await page.click('text=Data Import');
  await new Promise(r => setTimeout(r, 1000));

  const fileInput = await page.$('input[type=file]');
  await fileInput.uploadFile(
    'c:/Users/sanji/OneDrive/Desktop/test_client_grid.csv',
    'c:/Users/sanji/OneDrive/Desktop/test_client_sellout.csv'
  );

  await new Promise(r => setTimeout(r, 2000));

  await page.click('text=Dashboard');
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
