const fs = require('fs')

const errorModule = require('./error')

const tempDir = `${__dirname}/../temp`

/* データストアへコミット */
const commitJSON = (guild, data) => new Promise( (resolve, reject) => {

  fs.writeFile(`${tempDir}/${guild.id}.json`, JSON.stringify(data, null, 2), error => {
    if(error !== null) {
      console.log(error)

      reject(error)
      return
    }
    
    console.log('[modules.issue]<commitJSON> commit successful')
    resolve(null)
  })

})

/* 初期化処理 */
exports.init = guild => new Promise( (resolve, reject) => {

  fs.mkdir(`${tempDir}`, error => {

    /* 既存エラーは無視 */
    if(error !== null && error.code !== 'EEXIST') {
      console.log(error)

      reject(errorModule().EOTHER)
      return
    }

    const jsonData = {
      category: {},
      issues: {}
    }

    /* データをコミット */
    commitJSON(guild, jsonData).then(() => resolve(null)).catch(err => {
      console.log('[modules.issue] error', err)

      reject(errorModule(err).ECOMMIT_JSON)
      return
    })

  })

})

/* Issue 初期化処理 */
exports.initIssue = guild => new Promise( (resolve, reject) => {

  let jsonData = require(`${tempDir}/${guild.id}.json`)
  jsonData.issues = {}
  
  commitJSON(guild, jsonData).then(() => resolve(null)).catch(err => {
    console.log('[modules.issue] error', err)

    reject(errorModule(err).ECOMMIT_JSON)
    return
  })

})

/* Issue 作成処理 */
exports.create = (message, title) => new Promise( (resolve, reject) => {

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
  
    commitJSON(message.guild, jsonData).then(() => resolve(null)).catch(err => {
      console.log('[modules.issue] error', err)

      reject(errorModule(err).ECOMMIT_JSON)
      return
    })
    
  })
  
})

/* Issueチャンネル管理 */
exports.controlChannel = (op, message) => new Promise( (resolve, reject) => {
  
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
      reject(errorModule().EUNDEFINED_OPERATION)
      return
  }

  if(!(message.channel.id in jsonData.issues)) {
    reject(errorModule().ENOT_ISSUE_CHANNEL)
    return
  }

  message.channel.setParent(category).then(() => resolve(null))

})

/* Issue 削除処理(滅多に使わない) */
exports.delete = message => new Promise( (resolve, reject) => {
  
  const jsonData = require(`${tempDir}/${message.guild.id}.json`)
  if(!(message.channel.id in jsonData.issues)) {
    reject(errorModule().ENOT_ISSUE_CHANNEL)
    return
  }

  message.channel.delete().then(() => resolve(null))

})
