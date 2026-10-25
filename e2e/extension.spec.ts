import { test, expect } from './fixtures'

test('extracts full pastes, preserves partial edits, and opens tabs', async ({
  workspace: page,
  extensionContext
}) => {
  await page.locator('#urls').fill('Visit https://example.com and https://example.org today.')
  await page.locator('#extract').click()
  await expect(page.locator('#urls')).toHaveValue('https://example.com\nhttps://example.org\n')
  await extensionContext.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.evaluate(() =>
    navigator.clipboard.writeText('Links: https://example.net and https://example.edu.')
  )
  await page.locator('#urls').press('ControlOrMeta+A')
  await page.locator('#urls').press('ControlOrMeta+V')
  await expect(page.locator('#urls')).toHaveValue('https://example.net\nhttps://example.edu\n')
  await page.evaluate(() => navigator.clipboard.writeText('a note with https://example.test'))
  await page.locator('#urls').press('ArrowRight')
  await page.locator('#urls').press('ControlOrMeta+End')
  await page.locator('#urls').press('ControlOrMeta+V')
  await expect(page.locator('#urls')).toHaveValue(
    'https://example.net\nhttps://example.edu\na note with https://example.test'
  )
  await page.locator('#urls').fill('https://example.com\nhttps://example.org')
  await page.locator('#lazyLoad').check()
  await page.locator('#open').click()
  await expect(page.getByRole('status')).toContainText('Finished opening')
  await expect
    .poll(() =>
      extensionContext
        .pages()
        .filter((tab) => tab.url().includes('/lazyloading.html#'))
        .map((tab) => tab.url().split('#')[1])
    )
    .toEqual(['https://example.com', 'https://example.org'])
})
