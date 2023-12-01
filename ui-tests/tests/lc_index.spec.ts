import { IJupyterLabPage, expect, test } from '@jupyterlab/galata';
import { Page } from '@playwright/test';

function delay(ms: number) {
  // https://stackoverflow.com/questions/37764665/how-to-implement-sleep-function-in-typescript
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function myWaitForApplication({ baseURL }, use) {
  const waitIsReady = async (
    page: Page,
    helpers: IJupyterLabPage
  ): Promise<void> => {
    await page.waitForSelector('#jupyterlab-splash', {
      state: 'detached'
    });
    //! not wait for launcher tab.
    //   await helpers.waitForCondition(() => {
    //     return helpers.activity.isTabActive('Launcher');
    //   });
    //   // Oddly current tab is not always set to active
    //   if (!(await helpers.isInSimpleMode())) {
    //     await helpers.activity.activateTab('Launcher');
    //   }
  };
  await use(waitIsReady);
}

/**
 * Don't load JupyterLab webpage before running the tests.
 * This is required to ensure we capture all log messages.
 */
test.use({ autoGoto: false, waitForApplication: myWaitForApplication });
test('should emit an activation console message', async ({ page }) => {
  const logs: string[] = [];

  page.on('console', message => {
    logs.push(message.text());
  });
  // load jupyter lab
  await page.goto(undefined, { waitUntil: 'domcontentloaded' });

  expect(
    logs.filter(s => s === 'JupyterLab extension lc_index is activated!')
  ).toHaveLength(1);
});

test.use({ autoGoto: true, waitForApplication: myWaitForApplication });
test('should show README.md or README.svg if exists.', async ({ page }) => {
  // move to top directory
  let waitforTopFolder = async () => {
    await page.waitForSelector('div.jp-FileBrowser-crumbs');
    let fbc = page.locator('div.jp-FileBrowser-crumbs').first();
    let folderCaption = fbc.getByText(
      'tests-lc_index-should-show-README-md-or-README-svg-if-exists-'
    );
    await folderCaption.waitFor({ state: 'visible' });
  };
  await waitforTopFolder();
  await delay(1000);
  await page.filebrowser.openDirectory('.');

  // delete README.md and README.svg if exists
  if (await page.filebrowser.contents.fileExists('README.md')) {
    await page.filebrowser.contents.deleteFile('README.md');
  }
  if (await page.filebrowser.contents.fileExists('README.svg')) {
    await page.filebrowser.contents.deleteFile('README.svg');
  }

  // create "README.svg" as Text file
  await page.getByRole('menuitem', { name: 'File' }).click();
  await delay(100);
  await page.getByRole('listitem').filter({ hasText: 'New' }).click();
  await delay(100);
  await page.getByRole('menuitem', { name: 'Text File', exact: true }).click();
  await delay(1000);
  await page.getByRole('menuitem', { name: 'File' }).click();
  await delay(100);
  await page
    .getByRole('menuitem', { name: 'Close All Tabs', exact: true })
    .click();
  await delay(1000);
  if (await page.filebrowser.contents.fileExists('untitled.txt')) {
    await page.filebrowser.contents.renameFile('untitled.txt', 'README.svg');
  }

  // show README.svg
  await page.reload();
  await page.waitForSelector('div.jp-FileBrowser-crumbs');
  await delay(1000);
  let tabBar = page.locator('.lm-DockPanel-tabBar');
  let tabList = tabBar.getByRole('tablist');
  await expect(tabList.getByText('README.svg')).toHaveCount(1);

  // create "README.md" as Markdown file
  await page.getByRole('menuitem', { name: 'File' }).click();
  await delay(100);
  await page.getByRole('listitem').filter({ hasText: 'New' }).click();
  await delay(100);
  await page
    .getByRole('menuitem', { name: 'Markdown File', exact: true })
    .click();
  await delay(1000);
  await page.getByRole('menuitem', { name: 'File' }).click();
  await delay(100);
  await page
    .getByRole('menuitem', { name: 'Close All Tabs', exact: true })
    .click();
  await delay(1000);
  if (await page.filebrowser.contents.fileExists('untitled.md')) {
    await page.filebrowser.contents.renameFile('untitled.md', 'README.md');
  }

  // show README.svg
  await page.reload();
  await page.waitForSelector('div.jp-FileBrowser-crumbs');
  await delay(1000);
  tabBar = page.locator('.lm-DockPanel-tabBar');
  tabList = tabBar.getByRole('tablist');
  await expect(tabList.getByText('README.md')).toHaveCount(1);

  // delete README.md and README.svg if exists
  await page.filebrowser.openDirectory('.');
  if (await page.filebrowser.contents.fileExists('README.md')) {
    await page.filebrowser.contents.deleteFile('README.md');
  }
  if (await page.filebrowser.contents.fileExists('README.svg')) {
    await page.filebrowser.contents.deleteFile('README.svg');
  }
});
