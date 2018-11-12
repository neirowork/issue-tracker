const discord = require('discord.js')
const discordConfig = require('../.config/discord')

const issueModule = require('./issue')
const controlModule = require('./control')

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

    if(controlModule.isControlChannel(message.guild, message.channel)) {

      if(/^\/issue test$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> test')
      }
      else if(/^\/issue init all$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> all initialzation')

        issueModule.init(message.guild).then(() => {
          message.channel.send('設定ファイルの初期化に成功しました。')
        }).catch(err => {
          message.channel.send(err.readable)
        })

      }
      else if(/^\/issue init issues$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> issues initialzation')

        issueModule.initIssue(message.guild).then(() => {
          message.channel.send('Issueの初期化に成功しました。')
        }).catch(err => {
          message.channel.send(err.readable)
        })

      }
      else if(/^\/issue category$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> category list')
        
        controlModule.sendCategory(message)

      }
      else if(/^\/issue category (open|closed) ([0-9]+)$/.test(rcvMessage)) {
        console.log('[modules.discord]<message> set category')

        const args = rcvMessage.match(/^\/issue category (open|closed) ([0-9]+)$/)

        const ope = args[1]
        const categoryID = args[2]

        issueModule.setCategory(message.guild, ope, categoryID).then(() => {
          message.channel.send('カテゴリーのセットに成功しました。')
        }).catch(err => {
          message.channel.send(err.readable)
        })

      }
      // else if(/^\/issue delete$/.test(rcvMessage)) {
      //   console.log('[modules.discord]<message> delete channel')
  
      //   issueModule.delete(message).catch(err => {
      //     message.channel.send(err.readable)

      // })

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

      issueModule.controlChannel('close', message).then(() => {
        message.channel.send('クローズしました。')
      }).catch(err => {
        message.channel.send(err.readable)
      })

    }
    else if(/^\/issue reopen$/.test(rcvMessage)) {
      console.log('[modules.discord]<message> re-open issue')

      issueModule.controlChannel('reopen', message).then(() => {
        message.channel.send('再オープンしました。')
      }).catch(err => {
        message.channel.send(err.readable)
      })

    }

  })

  client.on('error', error => console.log(error))

}
