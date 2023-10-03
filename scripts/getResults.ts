import axios from 'axios'
import { JSDOM } from 'jsdom'

const RESULTS_BASE_URL = 'https://www.bing.com/images/create/results/'

export const getResults = async (id: string, loop = 0): Promise<string[]> => {
  console.log('CHECKING READY')

  if (loop >= 30) {
    console.log('EXCEEDED LOOP')
    return []
  }

  const resultsUrl = RESULTS_BASE_URL + id
  const cookie = process.env.COOKIE!

  const { data } = await axios({
    method: 'GET',
    url: resultsUrl,
    responseType: 'document',
    headers: {
      Cookie: cookie
    }
  })

  const dom = new JSDOM(data)
  const ready = !!dom.window.document.getElementById('gir_async')

  if (!ready) {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return await getResults(id, loop + 1)
  }

  console.log('RESULTS ARE READY')

  const imgs: string[] = []

  dom.window.document.querySelectorAll('#gir_async img[src]').forEach((img) => {
    imgs.push(img.getAttribute('src')?.split('?')[0] || '')
  })

  return imgs
}
