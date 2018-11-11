const discord = require('discord.js')
const discordConfig = require('../.config/discord')

const issueModule = require('./issue')

const client = new discord.Client()

let DEBUG_OPENISSUE = {}, DEBUG_CLOSEDISSUE = {}
let DEBUG_ISSUEID = 0

module.exports = () => {

  client.login(discordConfig.token)

  client.on('ready', () => {

    DEBUG_OPENISSUE = {
      '502741695163531266': client.channels.get('511113032378613760'),
      '311153653002272770': client.channels.get('511016673084571663')
    }
    DEBUG_CLOSEDISSUE = {
      '502741695163531266': client.channels.get('511113079702945811'),
      '311153653002272770': client.channels.get('511016746493149194')
    }

    console.log('[modules.discord] ready')

  })

  client.on('message', message => {

    if(message.author.id === client.user.id) return
    if(message.channel.type !== 'text') {
      console.log('[modules.discord]<message> message.channel.type !== \'text\'')

      message.channel.send('Issue Trackerが導入されているサーバでのみ利用できます。')
      return
    }

    const rcvMessage = message.content
    if(/^\/issue test$/.test(rcvMessage)) {
    }
    else if(/^\/issue init$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> initialzation')
      issueModule.init(message.guild).then(status => {
        if(status) {
          message.channel.send('初期化に成功しました。')
        }
      })
    }
    else if(/^\/issue create (.*)$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> create issue')

      const issueTitle = rcvMessage.match(/^\/issue create (.*)$/)[1]

      message.channel.startTyping()
      issueModule.create(message, issueTitle).then(() => {
        message.channel.stopTyping()
      })

    }
    else if(/^issue-[0-9]+$/.test(message.channel.name)) {

      if(/^\/issue close$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> close issue')

        message.channel.setParent(DEBUG_CLOSEDISSUE[message.guild.id])
        message.channel.send('Issueをクローズしました。')

      }
      else if(/^\/issue reopen$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> re-open issue')

        message.channel.setParent(DEBUG_OPENISSUE[message.guild.id])
        message.channel.send('Issueを再オープンしました。')

      }

    }

  })

  client.on('error', error => console.log(error))

}
