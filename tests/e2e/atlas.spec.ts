import { test, expect, type Page } from '@playwright/test';
import { chapters } from '../../src/content/chapters';

const runtimeErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
});
test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page), 'No uncaught browser runtime errors').toEqual([]);
});

async function openChapter(page: Page, id: string) {
  await page.goto(`./#/chapter/${id}`);
  await expect(page.locator('.lesson h1')).toBeVisible();
  await page.getByRole('tab', { name: /^速通/ }).click();
  await expect(page.locator('.lab')).toBeVisible();
}

test('home, four complete chapters, formulas, code, and direct hash refresh work under repository base', async ({ page }, testInfo) => {
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('让抽象的模型');
  await expect(page.locator('.chapter-card')).toHaveCount(4);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: testInfo.outputPath('homepage-desktop.png'), fullPage: true });

  for (const id of ['backprop', 'convolution', 'attention', 'ctc']) {
    await openChapter(page, id);
    await page.getByRole('tab', { name: /^深入/ }).click();
    await expect(page.locator('#lesson-panel .katex').first()).toBeVisible();
    await page.getByRole('tab', { name: /^实现/ }).click();
    await expect(page.locator('#lesson-panel pre code').first()).toBeVisible();
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/deep-learning-atlas/#/chapter/${id}$`));
    await expect(page.getByRole('tab', { name: /^实现/ })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#lesson-panel pre code').first()).toBeVisible();
  }
});

test('theme, bilingual search, completion and recent-reading settings survive reload', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: '切换深色模式' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: '搜索知识点' }).click();
  const dialog = page.getByRole('dialog', { name: '全站搜索' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('textbox', { name: '搜索关键词' }).fill('CTC');
  await dialog.getByRole('button').filter({ hasText: 'CTC' }).first().click();
  await expect(page).toHaveURL(/#\/chapter\/ctc$/);
  await page.getByRole('button', { name: /标记完成/ }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: /已完成/ })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('./');
  await expect(page.locator('.progress-strip')).toContainText('CTC');
  await page.getByRole('button', { name: '搜索知识点' }).click();
  await dialog.getByRole('textbox', { name: '搜索关键词' }).fill('卷积');
  await dialog.getByRole('button').filter({ hasText: '卷积' }).first().click();
  await expect(page).toHaveURL(/#\/chapter\/convolution$/);
});

test('backprop responds to parameter edits, performs a loss-reducing SGD step, and resets', async ({ page }) => {
  await openChapter(page, 'backprop');
  const lab = page.locator('.backprop-lab');
  const loss = lab.locator('.flow-node').filter({ hasText: '损失 L' }).locator('strong');
  const initialLoss = Number(await loss.textContent());
  const input = lab.getByRole('slider', { name: /输入 x/ });
  await input.focus();
  await input.press('ArrowRight');
  await expect(loss).not.toHaveText(initialLoss.toFixed(4));
  await lab.getByRole('button', { name: '重置', exact: true }).click();
  await expect(loss).toHaveText(initialLoss.toFixed(4));
  await lab.getByRole('button', { name: '执行一次 SGD 更新' }).click();
  await expect.poll(async () => Number(await loss.textContent())).toBeLessThan(initialLoss);
  await expect(lab.locator('.loss-history')).toBeVisible();
  await lab.getByRole('button', { name: '重置', exact: true }).click();
  await expect(lab.locator('.loss-history')).toHaveCount(0);
  await expect(input).toHaveValue('1.2');
});

test('convolution edits actually change output and stride, then reset restores the computation', async ({ page }) => {
  await openChapter(page, 'convolution');
  const lab = page.locator('.convolution-lab');
  const firstOutput = lab.getByRole('button', { name: /输出第 1 行第 1 列/ });
  await expect(firstOutput).toHaveText('3');
  await lab.getByRole('spinbutton', { name: '输入第 1 行第 1 列', exact: true }).fill('2');
  await expect(firstOutput).toHaveText('1');
  await lab.getByLabel(/步幅 Stride/).selectOption('2');
  await expect(lab.getByRole('button', { name: /输出第/ })).toHaveCount(4);
  await lab.getByRole('button', { name: '重置', exact: true }).click();
  await expect(firstOutput).toHaveText('3');
  await expect(lab.getByRole('button', { name: /输出第/ })).toHaveCount(9);
});

test('attention recomputes token dimensions, applies causal mask, exposes outputs, and resets', async ({ page }, testInfo) => {
  await openChapter(page, 'attention');
  const lab = page.locator('.attention-lab');
  await expect(lab.getByRole('slider', { name: '温度 τ' })).toBeVisible();
  await lab.getByRole('textbox', { name: /输入短句/ }).fill('甲 乙');
  await expect(lab.locator('.heatmap-table tbody tr')).toHaveCount(2);
  await lab.getByRole('checkbox', { name: '因果掩码 Causal mask' }).check();
  const firstRow = lab.locator('.heatmap-table tbody tr').first();
  await expect(firstRow.locator('td').nth(0)).toHaveText('100.0%');
  await expect(firstRow.locator('td').nth(1)).toHaveText('0.0%');
  await lab.getByRole('button', { name: /加权汇总 V/ }).click();
  await expect(lab.locator('.calculation-line')).toContainText('输出第 1 维');
  await lab.getByRole('button', { name: '重置', exact: true }).click();
  await expect(lab.getByRole('textbox', { name: /输入短句/ })).toHaveValue('我 喜欢 语音 模型');
  await expect(lab.locator('.heatmap-table tbody tr')).toHaveCount(4);
  await expect(lab.getByRole('checkbox', { name: '因果掩码 Causal mask' })).not.toBeChecked();
  await lab.screenshot({ path: testInfo.outputPath('attention-playground.png') });
});

test('CTC preserves duplicates separated by blank, sums paths, and responds to probability edits', async ({ page }) => {
  await openChapter(page, 'ctc');
  const lab = page.locator('.ctc-lab');
  const collapsed = lab.locator('.ctc-step').nth(2).locator('strong');
  await expect(collapsed).toHaveText('aa');
  await lab.getByLabel('候选路径帧 2', { exact: true }).selectOption('a');
  await expect(collapsed).toHaveText('a');
  const pathProbability = lab.locator('.lab-fieldset').nth(1).locator('.stat-row strong').first();
  const before = await pathProbability.textContent();
  await lab.getByRole('spinbutton', { name: '帧 1 的 a 权重', exact: true }).fill('0');
  await expect(pathProbability).toHaveText('0.00%');
  expect(before).not.toBe('0.00%');
  await lab.getByRole('button', { name: '重置实验', exact: true }).click();
  await expect(collapsed).toHaveText('aa');
  await expect(lab.getByRole('spinbutton', { name: '帧 1 的 a 权重', exact: true })).toHaveValue('0.5');
  const decisions = lab.locator('.lab-fieldset').nth(2).locator('.stat-row strong');
  await expect(decisions.nth(0)).toHaveText('aa');
  await expect(decisions.nth(1)).toHaveText('a');
});

for (const viewport of [{ name: 'mobile', width: 390, height: 844 }, { name: 'tablet', width: 768, height: 1024 }]) {
  test(`${viewport.name} layouts keep the page within viewport across reading and exploration`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of ['/', '/chapter/backprop', '/chapter/convolution', '/chapter/attention', '/chapter/ctc', '/map', '/architectures']) {
      await page.goto(`./#${route}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      if (route.startsWith('/chapter/')) await expect(page.locator('.lab')).toBeVisible();
      if (route === '/architectures') await expect(page.locator('.architecture-explorer')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${viewport.name} horizontal overflow at ${route}`).toBeLessThanOrEqual(1);
      if (route === '/') await page.screenshot({ path: testInfo.outputPath(`homepage-${viewport.name}.png`), fullPage: true });
    }
  });
}

test('notation is visible before equations and focus reading persists without hiding content', async ({ page }) => {
  await page.goto('./#/chapter/convolution');
  await page.getByRole('tab', { name: /^深入/ }).click();
  const firstSection=page.locator('#lesson-panel .lesson-section').first();
  await expect(firstSection.getByRole('heading', { name:'先认符号' })).toBeVisible();
  await expect(firstSection.locator('.formula-reading')).toBeVisible();
  await expect(firstSection.locator('.notation-guide')).toContainText('高度');
  expect(await firstSection.evaluate(section=>{
    const key=section.querySelector('.notation-guide')!;
    const formula=section.querySelector('.formula')!;
    return !!(key.compareDocumentPosition(formula)&Node.DOCUMENT_POSITION_FOLLOWING);
  })).toBe(true);
  await page.getByRole('button', {name:'专注阅读',exact:true}).click();
  await expect(page.locator('.reader-layout')).toHaveClass(/focus-reading/);
  await expect(page.locator('.sidebar')).toBeHidden();
  await expect(firstSection).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', {name:'退出专注阅读'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button', {name:'退出专注阅读'}).click();
  await expect(page.locator('.sidebar')).toBeVisible();
});

for(const moduleId of [0,1,2,3,4,5,6,7]) {
 test(`module ${moduleId}: every published chapter opens at all three reading depths`,async({page})=>{
  test.setTimeout(180000);
  for(const chapter of chapters.filter(item=>item.module===moduleId)) {
    await page.goto(`./#/chapter/${chapter.id}`);
    await expect(page.locator('.lesson h1')).toHaveText(chapter.title);
    for(const mode of ['速通','深入','实现']) {
      await page.getByRole('tab',{name:new RegExp('^'+mode)}).click();
      await expect(page.locator('#lesson-panel .lesson-section').first()).toBeVisible();
      await expect(page.locator('#lesson-panel .katex-error')).toHaveCount(0);
      if(mode==='实现') await expect(page.locator('#lesson-panel pre code').first()).toBeVisible();
    }
  }
 });
}

test('all curriculum entries link to lessons and older topic bookmarks redirect',async({page})=>{
 await page.goto('./#/curriculum');
 await expect(page.locator('.curriculum-module')).toHaveCount(8);
 await expect(page.locator('.topic-grid .planned-pill')).toHaveCount(0);
 await page.goto('./#/topic/optimizers');
 await expect(page).toHaveURL(/#\/chapter\//);
 await expect(page.locator('.lesson h1')).toBeVisible();
});

test('new long symbol guides and flow diagrams fit mobile and tablet widths',async({page},testInfo)=>{
 for(const width of [390,768]) {
  await page.setViewportSize({width,height:1000});
  for(const moduleId of [0,4,5,6,7]) {
   const chapter=chapters.find(item=>item.module===moduleId&&item.id!=='ctc')!;
   await page.goto(`./#/chapter/${chapter.id}`);
   await page.getByRole('tab',{name:/^深入/}).click();
   await expect(page.locator('#lesson-panel .lesson-section').first()).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth)).toBeLessThanOrEqual(1);
  }
  await page.screenshot({path:testInfo.outputPath(`symbol-reader-${width}.png`),fullPage:true});
 }
});
