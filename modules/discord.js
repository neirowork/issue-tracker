const discord = require('discord.js')
const discordConfig = require('../.config/discord')

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

    if(/^\/issue create (.*)$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> create issue')

      const issue = rcvMessage.match(/^\/issue create (.*)$/)[1]

      DEBUG_ISSUEID++

      message.channel.startTyping()
      message.guild.createChannel(`issue-${DEBUG_ISSUEID}`).then(channel => {

        channel.setParent(DEBUG_OPENISSUE[message.guild.id])
        channel.setTopic(issue)
        channel.send({
          embed: {
            title: `#${DEBUG_ISSUEID} ${issue}`,
            description: `${message.member.nickname}さんは、問題の詳細を報告してください。\n問題が解決したら、\`/issue close\` を送信してください。`
          }
        }).then(msg => msg.pin())

        message.channel.send(`<@!${message.author.id}> Issue #${DEBUG_ISSUEID} を作成しました。\n<#${channel.id}> で問題の詳細を報告してください。`).then(() => message.channel.stopTyping())

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
