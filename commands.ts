import { REST } from '@discordjs/rest'
import { SlashCommandBuilder } from '@discordjs/builders'
import { Routes } from 'discord-api-types/v9'

const apiToken = process.env.BOT_KEY!
const clientId = process.env.CLIENT_ID!

const commands = [
  new SlashCommandBuilder()
    .setName('gen')
    .setDescription('Generate a sticker')
    .addStringOption((option) =>
      option
        .setName('prompt')
        .setDescription('What to generate')
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option.setName('options').setDescription('Pick from 4 options before sending')
    )
].map((command) => command.toJSON())

const deploy = async () => {
  try {
    const rest = new REST({ version: '9' }).setToken(apiToken)
    await rest.put(Routes.applicationCommands(clientId) as any, { body: commands })

    console.log('Deployed Bot commands')
  } catch (err) {
    console.error('There was an error!', (err as any).message)
  }
}

deploy()
