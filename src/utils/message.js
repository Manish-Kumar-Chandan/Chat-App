const genrateMessageAndTime = (username,text)=>
{
    return{
        username, 
        text, 
        createdAt: new Date().getTime()}
}

const genrateUrlAndTime = (username,url)=>
{
    return{
        username, 
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = 
{
    genrateMessageAndTime,
    genrateUrlAndTime
}