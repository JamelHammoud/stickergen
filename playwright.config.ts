import { PlaywrightTestConfig, devices } from '@playwright/test'

const config: PlaywrightTestConfig = {
  use: {
    ...devices['Desktop Chrome'],
    headless: true
  }
}

export default config
