const discord = require('discord.js')
const discordConfig = require('../.config/discord')

const issueModule = require('./issue')

const client = new discord.Client()

module.exports = () => {

  client.login(discordConfig.token)

  client.on('ready', () => {

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

    if(message.channel.id === '511206923614421002') {

      if(/^\/issue test$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> test')
      }
      else if(/^\/issue init all$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> all initialzation')

        issueModule.init(message.guild).then(status => {
          if(status === null) {
            message.channel.send('設定ファイルの初期化に成功しました。')
          }
        }).catch(err => {
          message.channel.send('エラーが発生しました。')
        })
        
      }
      else if(/^\/issue init issues$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> issues initialzation')

        issueModule.initIssue(message.guild).then(status => {
          if(status) {
            message.channel.send('Issueの初期化に成功しました。')
          }
        })
      }
      // else if(/^\/issue delete$/.test(rcvMessage)) {
      //   console.log('[modules.discord]<message> delete channel')
  
      //   issueModule.delete(message).then(status => {
      //     if(!status) {
      //       message.channel.send('このチャンネルは削除できません。')
      //     }
      //   })
  
      // }

    }
    
    if(/^\/issue create (.*)$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> create issue')

      const issueTitle = rcvMessage.match(/^\/issue create (.*)$/)[1]

      message.channel.startTyping()
      issueModule.create(message, issueTitle).then(() => {
        message.channel.stopTyping()
      })

    }
    else if(/^\/issue (?:close)$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> close issue')

      issueModule.controlChannel('close', message).then(status => {
        if(status) {
          message.channel.send('クローズしました。')
        } else {
          message.channel.send('このチャンネルではクローズできません。')
        }
      })

    }
    else if(/^\/issue reopen$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> re-open issue')

      issueModule.controlChannel('reopen', message).then(status => {
        if(status) {
          message.channel.send('再オープンしました。')
        } else {
          message.channel.send('このチャンネルでは再オープンできません。')
        }
      })

    }

  })

  client.on('error', error => console.log(error))

}
