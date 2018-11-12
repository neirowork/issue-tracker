const async = require('async')

const tempDir = `${__dirname}/../temp`

exports.isControlChannel = (guild, channel) => {

  const jsonData = require(`${tempDir}/${guild.id}.json`)

  if(jsonData.channel.control === channel.id) {
    return true
  } else {
    return false
  }

}

exports.sendCategory = message => {

  const channelsArray = message.guild.channels.array()
  const fields = []

  async.each(channelsArray, (ch, callback) => {
    if(ch.type === 'category') {
      fields.push({
        name: ch.name,
        value: `\`${ch.id}\``,
        inline: true
      })
    }
    callback()

  }, () => {
    message.channel.send({
      embed: {
        title: 'このサーバーにあるカテゴリー一覧',
        fields
      }
    })
  })

}
