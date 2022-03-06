require('dotenv').config()
const { google } = require('googleapis')
const prettySeconds = require('pretty-seconds')
const scopes = 'https://www.googleapis.com/auth/analytics.readonly'

const jwt = new google.auth.JWT(process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL, null, process.env.GOOGLE_ANALYTICS_PRIVATE_KEY.replace(/\\n/g, '\n'), scopes)

async function getData(dateString) {
    const result = await google.analytics('v3').data.ga.get({
        'auth': jwt,
        'ids': `ga:${process.env.GOOGLE_ANALYTICS_VIEW_ID}`,
        'start-date': dateString,
        'end-date': dateString,
        'metrics': 'ga:users,ga:newUsers,ga:pageviews,ga:uniquePageviews,ga:sessions,ga:percentNewSessions,ga:avgTimeOnPage,ga:bounceRate'
    })

    return result.data.totalsForAllResults
}

module.exports = async (client) => {
    client.channels.cache.get(process.env.TESTING_CHANNEL_ID).send("Time to log analytics data...")

    let date = new Date()
    const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD format

    const prettyDate = date.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })

    const authorizeJWT = await jwt.authorize()
    const data = await getData(dateString)

    const message = `
Hey genics community! Here are the blog's stats for **${prettyDate}**:

⦁ There were a total of **${data["ga:pageviews"]} pageviews** out of which **${data["ga:uniquePageviews"]}** were unique!

⦁ A total of **${data["ga:users"]} viewers** visited genics today, out of which **${data["ga:newUsers"]}** were new to the site!

⦁ The average time spent on a page was **${prettySeconds(parseFloat(data["ga:avgTimeOnPage"]))}** and the bounce rate was **${parseFloat(data["ga:bounceRate"]).toFixed(2)}%**!

⦁ There were **${data["ga:sessions"]} sessions** today, out of which **${parseFloat(data["ga:percentNewSessions"]).toFixed(2)}%** were new!

I hope you find this data beneficial :)
`
    client.channels.cache.get(process.env.ANALYTICS_CHANNEL_ID).send(message)
}