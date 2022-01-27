const axios = require('axios')
const fs = require('fs');
const fm = require('front-matter')

let data = {}

async function getNewFiles() {
  fs.readFile('./util/data.json', 'utf8', (err, jsonString) => {
    if (err) {
      console.log("File read failed:", err)
    }
    data = JSON.parse(jsonString)
  })
  
  let response = await axios.get(
    "https://api.github.com/repos/genicsblog/genicsblog.github.io/contents/_drafts"
  )

  const newFiles = []

  for(let i = 0; i < response.data.length; i++) {
    const file = response.data[i]

    if (data[file.name.replace(".md", "")] === true) continue

    let resp = await axios.get(
      `https://api.github.com/repos/genicsblog/genicsblog.github.io/contents/${file.path}`
    )

    if(resp.data.name != "test.md") {
      const content = Buffer.from(resp.data.content, 'base64').toString()
      const attributes = fm(content).attributes

      if (attributes.original === null || attributes.original === undefined) {
        const permalink = attributes.permalink || resp.data.name.replace(".md", "").toLowerCase()
        newFiles.push(permalink)
      }
    }
  }

  return newFiles
}

function sendMessage(newFiles, client) {
  if (newFiles.length == 0) {
    client.channels.cache.get("935837221901180998").send("No articles to review :D")
    return
  }

  var message = "<@&935778876448190574> Here are some new articles to review!\n\n"

  newFiles.forEach(fileName => {
    message += `- <https://genicsblog.com/draft/${fileName}> \n`
    data[fileName] = true
  })

  client.channels.cache.get("935837221901180998").send(message)

  const jsonString = JSON.stringify(data)

  fs.writeFile('./util/data.json', jsonString, err => {
    if (err) {
      console.log('Error writing file', err)
    } else {
      console.log('Successfully wrote file')
    }
  })
}

module.exports = async (client) => {
  const files = await getNewFiles()
  sendMessage(files, client)
}