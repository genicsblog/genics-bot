require('dotenv').config()
const axios = require('axios')
const { google } = require('googleapis')
const prettySeconds = require('pretty-seconds')
const scopes = 'https://www.googleapis.com/auth/analytics.readonly'

const jwt = new google.auth.JWT(process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL, null, process.env.GOOGLE_ANALYTICS_PRIVATE_KEY.replace(/\\n/g, '\n'), scopes)

const body = {
    "dateRanges": [
      {
        "startDate": "yesterday",
        "endDate": "yesterday"
      }
    ],
    "metrics": [
      {
        "name": "activeUsers",
        "invisible": false
      }, {
        "name": "newUsers",
        "invisible": false 
      }, {
        "name": "screenPageViews",
        "invisible": false
      }, {
        "name": "sessions",
        "invisible": false
      },{
        "name": "averageSessionDuration",
        "invisible": false
      }, {
        "name": "bounceRate",
        "invisible": false
      }
    ]
}

const url = `https://analyticsdata.googleapis.com/v1beta/${process.env.GOOGLE_ANALYTICS_VIEW_ID}:runReport`

async function getData(access_token) {
    const result = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
    })

    return result.data.rows[0].metricValues
}

module.exports = async (client) => {
    client.channels.cache.get(process.env.TESTING_CHANNEL_ID).send("Time to log analytics data...")

    let date = new Date(Date.now() - 864e5)

    const prettyDate = date.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })

    const authorizeJWT = await jwt.authorize()
    const data = await getData(authorizeJWT.access_token)

    const message = `
Hey genics community! Here are the blog's stats for **${prettyDate}**:

⦁ There were a total of **${data[2].value} pageviews**!

⦁ A total of **${data[0].value} viewers** visited genics, out of which **${data[1].value}** were new to the site!

⦁ There were **${data[3].value} sessions** and the average session duration was **${prettySeconds(parseFloat(data[4].value))}**!

⦁ The bounce rate was **${(parseFloat(data[5].value) * 100.00).toFixed(2)}%**

I hope you find this data beneficial :)
`
    client.channels.cache.get(process.env.ANALYTICS_CHANNEL_ID).send(message)
}
