import { chromium } from 'playwright'

const CREATE_BASE_URL = 'https://www.bing.com/images/create'
const RESULTS_BASE_URL = 'https://www.bing.com/images/create/results/'

export const generateImages = async (prompt: string) => {
  const browser = await chromium.launch()
  const createUrl = CREATE_BASE_URL + `?q=${prompt}&rt=4&FORM=GENCRE`

  const cookie = process.env.COOKIE!

  console.log('OPENING PAGE')

  const page = await browser.newPage({
    extraHTTPHeaders: {
      Cookie: cookie
    }
  })

  console.log('GOING TO URL: ' + createUrl)

  await page.goto(createUrl)

  // console.log('WAITING FOR SELECTOR')

  // await new Promise((resolve) => setTimeout(resolve, 20000))

  // console.log('URL: ' + page.url())

  const id = page.url().split('&id=')[1]

  if (!id) {
    console.log('NO ID FOUND')

    return
  }

  console.log('ID: ' + id)

  const resultsUrl = RESULTS_BASE_URL + id

  console.log('GOING TO RESULTS PAGE: ' + RESULTS_BASE_URL + id)

  await page.goto(resultsUrl)

  let loop = 0

  while (true) {
    console.log('CHECKING READY')

    const exists = await page.isVisible('#gir_async')

    if (exists) {
      console.log('WE FOUND IT!')
      break
    }

    if (loop >= 30) {
      console.log('EXCEEDED LOOP')
      break
    }

    loop++
    await page.reload()
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log('WAITING FOR SELECTOR')

  await Promise.all([page.waitForSelector('#gir_async')])

  console.log('FINDING IMAGES')

  const imgs = await page.$$eval('#gir_async img[src]', (imgs) =>
    imgs.map((img: any) => img.src.split('?')[0])
  )

  console.log('IMAGES: ' + imgs)

  await browser.close()

  return imgs
}
