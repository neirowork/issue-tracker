const fs = require('fs')

const tempDir = `${__dirname}/../temp`

/* データストアへコミット */
const commitJSON = (guild, data) => new Promise( resolve => {

  fs.writeFile(`${tempDir}/${guild.id}.json`, JSON.stringify(data, null, 2), error => {
    if(error !== null) resolve(false)
    
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
    }
    else {
      
      const jsonData = {
        category: {},
        issues: []
      }

      /* データをコミット */
      commitJSON(guild, jsonData).then(status => resolve(status))

    }
  })

})

/* Issue 作成処理 */
exports.create = (message, title) => new Promise(resolve => {

  const jsonData = require(`${tempDir}/${message.guild.id}.json`)
  const issueID = jsonData.issues.length + 1

  message.guild.createChannel(`issue-${issueID}`).then(ch => {

    ch.setParent(jsonData.category.open)
    ch.setTopic(title)
    ch.send({
      embed: {
        title: `#${issueID} ${title}`,
        description: `${message.member.nickname}さんは、問題の詳細を報告してください。\n問題が解決したら、\`/issue close\` を送信してください。`
      }
    }).then(msg => msg.pin())

    message.channel.send(`<@!${message.author.id}> Issue #${issueID} を作成しました。\n<#${ch.id}> で問題の詳細を報告してください。`)

    jsonData.issues.push({
      id: issueID,
      title,
      channel: ch.id
    })
  
    commitJSON(message.guild, jsonData).then(status => resolve(status))

  })
  
})
