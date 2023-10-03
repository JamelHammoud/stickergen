import axios from 'axios'
import { getResults } from './getResults'

const CREATE_BASE_URL = 'https://www.bing.com/images/create'

export const generateImages = async (prompt: string) => {
  const createUrl = CREATE_BASE_URL + `?q=${prompt}&rt=4&FORM=GENCRE`

  const cookie = process.env.COOKIE!

  console.log('LOADING PROMPT: ' + prompt)

  const { request } = await axios({
    method: 'GET',
    url: createUrl,
    responseType: 'document',
    headers: {
      Cookie: cookie
    }
  })

  const url = request.res.responseUrl as string
  const id = url.split('&id=')[1]

  if (!id) {
    console.log('NO ID FOUND')

    return
  }

  console.log('ID: ' + id)

  return await getResults(id)
}
