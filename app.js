const discord = require('discord.js')
const discordConfig = require('./.config/discord')

const client = new discord.Client()
client.login(discordConfig.token)

client.on('ready', () => {

})

client.on('message', message => {

  if(message.member.id != client.user.id) {

    const rcvMessage = message.content

  }

})

client.on('error', error => {

  console.log(error)

})
