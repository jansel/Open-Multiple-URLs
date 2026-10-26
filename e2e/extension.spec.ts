import { test, expect } from './fixtures'

test('extracts full pastes, preserves partial edits, and opens tabs', async ({
  workspace: page,
  extensionContext
}) => {
  const options = page.getByRole('complementary', { name: 'Opening options' })
  const extract = options.getByRole('button', { name: 'Extract URLs from text' })
  await expect(extract).toBeDisabled()
  await page.locator('#urls').fill('Visit https://example.com and https://example.org today.')
  await expect(extract).toBeEnabled()
  await extract.click()
  await expect(page.locator('#urls')).toHaveValue('https://example.com\nhttps://example.org\n')
  await expect(extract).toBeDisabled()
  await extensionContext.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.evaluate(() =>
    navigator.clipboard.writeText('Links: https://example.net and https://example.edu.')
  )
  await page.locator('#urls').press('ControlOrMeta+A')
  await page.locator('#urls').press('ControlOrMeta+V')
  await expect(page.locator('#urls')).toHaveValue('https://example.net\nhttps://example.edu\n')
  await expect(extract).toBeDisabled()
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
