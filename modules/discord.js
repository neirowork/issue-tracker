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
    else if(/^\/issue init all$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> initialzation')
      issueModule.init(message.guild).then(status => {
        if(status) {
          message.channel.send('設定ファイルの初期化に成功しました。')
        }
      })
    }
    else if(/^\/issue init issues$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> initialzation')
      issueModule.initIssue(message.guild).then(status => {
        if(status) {
          message.channel.send('Issueの初期化に成功しました。')
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
    else if(/^\/issue close$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> close issue')

      issueModule.close(message).then(status => {
        if(status) {
          message.channel.send('クローズしました。')
        } else {
          message.channel.send('このチャンネルではクローズできません。')
        }
      })

    }
    else if(/^\/issue reopen$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> re-open issue')

      issueModule.reOpen(message).then(status => {
        if(status) {
          message.channel.send('再オープンしました。')
        } else {
          message.channel.send('このチャンネルでは再オープンできません。')
        }
      })

    }
    else if(/^\/issue delete$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> delete channel')

      issueModule.delete(message).then(status => {
        if(!status) {
          message.channel.send('このチャンネルは削除できません。')
        }
      })

    }

  })

  client.on('error', error => console.log(error))

}
