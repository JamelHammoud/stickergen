import Canvas from '@napi-rs/canvas'
import {
  Client,
  IntentsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder
} from 'discord.js'
import { generateImages } from './scripts/generateImages'

const bot = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages]
})

bot.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isCommand() && !interaction.isUserContextMenuCommand()) {
      return
    }

    const { commandName, options } = interaction

    if (commandName !== 'gen') {
      return
    }

    const prompt = encodeURIComponent(options.get('prompt')?.value as string)
    const showOptions = [undefined, true].includes(options.get('options')?.value as boolean)

    if (!prompt) {
      return
    }

    await interaction.deferReply()

    const imgs = await generateImages(prompt)

    if (!imgs?.length) {
      await interaction.editReply({
        content: 'Whoops, it looks like OpenAI blocked that one :('
      })

      return
    }

    if (!showOptions) {
      const img = imgs[Math.floor(Math.random() * imgs.length)]

      await interaction.editReply({
        content: img
      })

      return
    }

    const IMG_WIDTH = 1024

    const canvas = Canvas.createCanvas(IMG_WIDTH * 2, IMG_WIDTH * 2)
    const context = canvas.getContext('2d')

    for (const img of imgs) {
      const index = imgs.indexOf(img)
      const data = await Canvas.loadImage(img)
      const top = [0, 2].includes(index) ? 0 : IMG_WIDTH
      const left = [0, 1].includes(index) ? 0 : IMG_WIDTH

      context.drawImage(data, top, left, IMG_WIDTH, IMG_WIDTH)
    }

    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
      name: 'image.png'
    })

    const optionButton = new ActionRowBuilder<ButtonBuilder>().addComponents(
      imgs.map((img, index) => {
        return new ButtonBuilder()
          .setCustomId(`${index}`)
          .setLabel(`${index + 1}`)
          .setStyle(ButtonStyle.Secondary)
      })
    )

    const response = await interaction.editReply({
      files: [attachment],
      components: [optionButton]
    })

    const confirmation = await response.awaitMessageComponent({
      filter: (i) => i.user.id === interaction.user.id,
      time: 600000
    })

    const index = parseInt(confirmation.customId)

    await interaction.editReply({
      content: imgs[index],
      files: [],
      components: []
    })
  } catch (err) {
    console.error(err)
  }
})

bot.on('ready', () => {
  console.log('ready')
})

bot.login(process.env.BOT_KEY)
