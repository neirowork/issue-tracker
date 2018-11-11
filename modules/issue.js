const fs = require('fs')

const tempDir = `${__dirname}/../temp`

/* データストアへコミット */
const commitJSON = (guild, data) => new Promise( resolve => {

  fs.writeFile(`${tempDir}/${guild.id}.json`, JSON.stringify(data, null, 2), error => {
    if(error !== null) {
      console.log(error)

      resolve(false)
      return
    }
    
    console.log('[modules.issue]<commitJSON> commit successful')
    resolve(true)
  })

})

/* 初期化処理 */
exports.init = guild => new Promise(resolve => {

  fs.mkdir(`${tempDir}`, error => {

    /* 既存エラーは無視 */
    if(error !== null && error.code !== 'EEXIST') {
      console.log(error)

      resolve(false)
      return
    }
    else {

      const jsonData = {
        category: {},
        issues: {}
      }
      /* データをコミット */
      commitJSON(guild, jsonData).then(status => resolve(status))

    }
  })

})

/* Issue 初期化処理 */
exports.initIssue = guild => new Promise(resolve => {

  let jsonData = require(`${tempDir}/${guild.id}.json`)
  jsonData.issues = {}
  
  commitJSON(guild, jsonData).then(status => resolve(status))

})

/* Issue 作成処理 */
exports.create = (message, title) => new Promise(resolve => {

  const jsonData = require(`${tempDir}/${message.guild.id}.json`)
  const issueID = Object.keys(jsonData.issues).length + 1

  message.guild.createChannel(`issue-${issueID}`).then(ch => {

    const name = message.member.nickname !== null ? message.member.nickname : message.author.username

    ch.setParent(jsonData.category.open)
    ch.setTopic(title)
    ch.send({
      embed: {
        title: `#${issueID} ${title}`,
        description: `${name}さんは、問題の詳細を報告してください。\n問題が解決したら、\`/issue close\` を送信してください。`
      }
    }).then(msg => msg.pin())

    message.channel.send(`<@!${message.author.id}> Issue #${issueID} を作成しました。\n<#${ch.id}> で問題の詳細を報告してください。`)

    const issue = {}
    issue[ch.id] = {
      id: issueID,
      title
    }
    Object.assign(jsonData.issues, issue)
  
    commitJSON(message.guild, jsonData).then(status => resolve(status))

  })
  
})

/* Issueチャンネル管理 */
exports.controlChannel = (op, message) => new Promise(resolve => {
  
  const jsonData = require(`${tempDir}/${message.guild.id}.json`)
  let category = ''
  
  switch(op) {
    case 'close':
      category = jsonData.category.closed
      break
    
    case 'reopen':
      category = jsonData.category.open
      break
    
    default:
      resolve(false)
      return
  }

  if(!(message.channel.id in jsonData.issues)) {
    resolve(false)
    return
  }

  message.channel.setParent(category).then(() => resolve(true))

})

/* Issue 削除処理(滅多に使わない) */
exports.delete = message => new Promise(resolve => {
  
  const jsonData = require(`${tempDir}/${message.guild.id}.json`)
  if(!(message.channel.id in jsonData.issues)) {
    resolve(false)
    return
  }

  message.channel.delete().then(() => resolve(true))

})