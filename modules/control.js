const tempDir = `${__dirname}/../temp`

exports.isControlChannel = (guild, channel) => {

  const jsonData = require(`${tempDir}/${guild.id}.json`)

  if(jsonData.channel.control === channel.id) {
    return true
  } else {
    return false
  }

}
