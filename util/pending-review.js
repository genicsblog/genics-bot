const axios = require('axios')
const fs = require('fs')
const fm = require('front-matter')

let data = {}

async function getNewFiles() {
  let response = await axios.get(
    "https://api.github.com/repos/genicsblog/genicsblog.com/contents/_drafts"
  )

  const newFiles = []

  for (let i = 0; i < response.data.length; i++) {
    const file = response.data[i]

    if (data["drafts"].includes(file.name.replace(".md", "").toLowerCase())) continue

    let resp = await axios.get(
      `https://api.github.com/repos/genicsblog/genicsblog.com/contents/${file.path}`
    )

    if (resp.data.name != "test.md") {
      const content = Buffer.from(resp.data.content, 'base64').toString()
      const attributes = fm(content).attributes

      if (attributes.original === null || attributes.original === undefined) {
        const permalink = attributes.permalink || resp.data.name.replace(".md", "").toLowerCase()
        newFiles.push([permalink, resp.data.name.replace(".md", "")])
      }
    }
  }

  return newFiles
}

function sendMessage(newFiles, client, notify) {
  if (newFiles.length == 0) {
    if (notify) client.channels.cache.get(process.env.REVIEW_CHANNEL_ID).send("No articles to review :D")
    return
  }

  var message = "<@&935778876448190574> Here are some new articles to review!\n\n"

  newFiles.forEach(fileName => {
    message += `⦁ Preview: https://genicsblog.com/draft/${fileName[0]}\nGitHub: <https://github.com/genicsblog/genicsblog.com/blob/master/_drafts/${fileName[1]}.md>\n\n`
    data["drafts"].push(fileName[0])
  })

  client.channels.cache.get(process.env.REVIEW_CHANNEL_ID).send(message)
  const jsonString = JSON.stringify(data)

  fs.writeFile('./temp.txt', jsonString, err => {
    if (err) {
      console.log('Error writing file for pending reviews command', err)
    } else {
      client.channels.cache.get(process.env.JSON_CHANNEL_ID).send({ files: ["./temp.txt"] });
    }
  })
}

module.exports = async (client, notify) => {
  client.channels.cache.get(process.env.TESTING_CHANNEL_ID).send("Retreiving drafts that are pending review...")

  await client.channels.cache.get(process.env.JSON_CHANNEL_ID).messages.fetch({ limit: 1 }).then(messages => {
    let message = messages.first()
    if (message.attachments) {
      let attachments = message.attachments
      for (let file of attachments) {
        axios(file[1].url).then(async res => {
          data = res.data

          const files = await getNewFiles()
          sendMessage(files, client, notify)
        })
      }
    }
  }).catch(console.error);
}