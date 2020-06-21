const users = []

const adduser = ({id, username, room})=>
{
    //Cleaning Data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate Data
    if(!username || !room)
    {
        return{ error: 'Username And Room is Required' }
    }

    //Check for existing user
    const excitingUser = users.find((user)=>
    {
        return user.username === username && user.room === room
    })

    //valitdate User
    if(excitingUser)
    {
        return{ error:'User Name is in use!' }
    }

    //Store User
    const user = {id, username, room}
    users.push(user)
    return {user}
}

//Remove User
const removeUser = (id)=>
{
    const index = users.findIndex((user)=>user.id===id)

    if(index !== -1)
    {
        return users.splice(index, 1)[0]
    }
}

//Getting User
const getUser = (id)=>
{
    return users.find((user)=>user.id===id)
}
//Geeting User From Room
const getUsersInRoom = (room)=>
{
    return users.filter((user)=>user.room === room)
}


module.exports = 
{
    adduser,
    removeUser,
    getUser,
    getUsersInRoom
}