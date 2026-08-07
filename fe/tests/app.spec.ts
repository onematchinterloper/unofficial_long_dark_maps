import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

const maps = JSON.parse(readFileSync(new URL('../public/assets/js/maps.json', import.meta.url), 'utf8'))

const testImage = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1200"><rect width="100%" height="100%" fill="#ddd"/></svg>',
)

test.beforeEach(async ({ page }) => {
  await page.route(/images\.steamusercontent\.com|i\.imgur\.com|i\.redd\.it/, route =>
    route.fulfill({ status: 200, contentType: 'image/svg+xml', body: testImage }),
  )
})

test('every catalog route returns 200', async ({ request }) => {
  const paths = ['/', '/about/']
  for (const group of [maps.regions, maps.transitions]) {
    for (const [mapId, map] of Object.entries<any>(group)) {
      paths.push(`/region/${encodeURIComponent(mapId)}/`)
      for (const locationId of Object.keys(map.locations ?? {})) {
        paths.push(`/region/${encodeURIComponent(mapId)}/${encodeURIComponent(locationId)}/`)
      }
    }
  }
  expect(paths).toHaveLength(45)
  for (const path of paths) expect((await request.get(path)).status(), path).toBe(200)
})

test('about page presents credits and project information', async ({ page }) => {
  const response = await page.goto('about/')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('About & credits')
  await expect(page.getByRole('heading', { name: 'Credits and map sources' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Disclaimer' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Privacy' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Feedback and contributions' })).toBeVisible()
  await expect(page).toHaveTitle('About & Credits — Unofficial Long Dark Maps')
})

test('about page scrolls to all credits on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only behavior')
  await page.goto('about/')
  const about = page.locator('.aboutPage')
  await expect(about).toBeVisible()
  const dimensions = await about.evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
  }))
  expect(dimensions.scrollHeight).toBeGreaterThan(dimensions.clientHeight)
  await about.evaluate((element) => element.scrollTo({ top: element.scrollHeight }))
  await expect(page.getByRole('heading', { name: 'Feedback and contributions' })).toBeInViewport()
})

test('direct region and transition routes load as real pages', async ({ page }) => {
  for (const path of ['region/forsaken-airfield/', 'region/cave-brm-twm/']) {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('.tldViewer img')).toBeVisible()
    await expect(page).toHaveTitle(/Map — The Long Dark/)
  }
})

test('zoom controls and keyboard recovery work', async ({ page }) => {
  await page.goto('region/forsaken-airfield/')
  const zoom = page.getByLabel('Zoom level')
  await expect(zoom).toHaveText('100%')
  await page.getByLabel('Zoom in').click()
  await expect(zoom).toHaveText('125%')
  await page.locator('.tldViewer').focus()
  await page.keyboard.press('+')
  await expect(zoom).toHaveText('156%')
  await page.keyboard.press('0')
  await expect(zoom).toHaveText('100%')
})

test('desktop navigation panel can be resized and remembers its width', async ({ page, isMobile }) => {
  test.skip(isMobile, 'desktop-only behavior')
  await page.goto('region/forsaken-airfield/')
  const panel = page.getByRole('complementary', { name: 'Navigation' })
  const handle = page.getByRole('separator', { name: 'Resize navigation panel' })
  await expect(panel).toHaveCSS('width', '320px')
  await handle.focus()
  await page.keyboard.press('Shift+ArrowRight')
  await expect(panel).toHaveCSS('width', '360px')
  await page.reload()
  await expect(panel).toHaveCSS('width', '360px')
})

test('image failure offers retry and original source', async ({ page }) => {
  await page.unroute(/images\.steamusercontent\.com|i\.imgur\.com|i\.redd\.it/)
  await page.route(/images\.steamusercontent\.com|i\.imgur\.com|i\.redd\.it/, route => route.abort())
  await page.goto('region/forsaken-airfield/')
  await expect(page.getByRole('alert')).toContainText('could not be loaded')
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open original' })).toBeVisible()
})

test('mobile drawer traps and restores focus', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only behavior')
  await page.goto('region/forsaken-airfield/')
  const open = page.getByRole('button', { name: 'Open navigation menu' })
  await open.focus()
  await open.click()
  const dialog = page.getByRole('dialog', { name: 'Navigation' })
  await expect(dialog).toBeVisible()
  await expect(page.locator('.tldMain')).toHaveAttribute('aria-hidden', 'true')
  const openDrawerA11y = await new AxeBuilder({ page }).analyze()
  expect(openDrawerA11y.violations.filter(violation => ['critical', 'serious'].includes(violation.impact ?? ''))).toEqual([])
  const focusable = dialog.locator('a[href], button:not([disabled])')
  await focusable.last().focus()
  await page.keyboard.press('Tab')
  await expect(focusable.first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeHidden()
  await expect(open).toBeFocused()
})

test('mobile pinch stays anchored and continues as one-finger pan', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only behavior')
  await page.goto('region/forsaken-airfield/')
  const viewer = page.locator('.tldViewer')
  const image = viewer.locator('img')
  await expect(image).toBeVisible()
  const box = await viewer.boundingBox()
  const before = await image.boundingBox()
  expect(box).not.toBeNull()
  expect(before).not.toBeNull()
  const midpoint = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 }
  const initialDistance = 80
  const pointer = (pointerId: number, clientX: number, clientY: number) => ({
    pointerId,
    pointerType: 'touch',
    clientX,
    clientY,
    buttons: 1,
    isPrimary: pointerId === 1,
  })

  await viewer.dispatchEvent('pointerdown', pointer(1, midpoint.x - initialDistance, midpoint.y))
  await viewer.dispatchEvent('pointerdown', pointer(2, midpoint.x + initialDistance, midpoint.y))
  await viewer.dispatchEvent('pointermove', pointer(1, midpoint.x - 130, midpoint.y))
  await viewer.dispatchEvent('pointermove', pointer(2, midpoint.x + 130, midpoint.y))
  await expect(page.getByLabel('Zoom level')).not.toHaveText('100%')

  const after = await image.boundingBox()
  const u = (midpoint.x - before!.x) / before!.width
  const v = (midpoint.y - before!.y) / before!.height
  expect(Math.abs(after!.x + u * after!.width - midpoint.x)).toBeLessThan(4)
  expect(Math.abs(after!.y + v * after!.height - midpoint.y)).toBeLessThan(4)

  await viewer.dispatchEvent('pointerup', { ...pointer(2, midpoint.x + 130, midpoint.y), buttons: 0 })
  const transformBeforePan = await image.evaluate(element => element.style.transform)
  await viewer.dispatchEvent('pointermove', pointer(1, midpoint.x - 100, midpoint.y + 30))
  await expect.poll(() => image.evaluate(element => element.style.transform)).not.toBe(transformBeforePan)
  await viewer.dispatchEvent('pointerup', { ...pointer(1, midpoint.x - 100, midpoint.y + 30), buttons: 0 })
})

test('mobile zoom controls stay anchored to the viewport', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'mobile-only behavior')
  await page.goto('region/forsaken-airfield/')
  const controls = page.locator('.tldViewerControls')
  await expect(controls).toBeVisible()
  const before = await controls.boundingBox()
  expect(before).not.toBeNull()

  for (let step = 0; step < 7; step += 1) await page.getByLabel('Zoom in').click()
  const zoomedIn = await controls.boundingBox()
  expect(zoomedIn).not.toBeNull()
  expect(Math.abs(zoomedIn!.x - before!.x)).toBeLessThan(1)
  expect(Math.abs(zoomedIn!.y - before!.y)).toBeLessThan(1)

  for (let step = 0; step < 14; step += 1) await page.getByLabel('Zoom out').click()
  const zoomedOut = await controls.boundingBox()
  expect(zoomedOut).not.toBeNull()
  expect(Math.abs(zoomedOut!.x - before!.x)).toBeLessThan(1)
  expect(Math.abs(zoomedOut!.y - before!.y)).toBeLessThan(1)
})

test('has no serious automated accessibility violations', async ({ page }) => {
  await page.goto('region/forsaken-airfield/')
  await expect(page.locator('.tldViewer img')).toBeVisible()
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations.filter(violation => ['critical', 'serious'].includes(violation.impact ?? ''))).toEqual([])
})
