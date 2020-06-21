
//This is Client Side
const socket = io()

//Element
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Tetmplates
const messageTemplate = document.querySelector('#message-template').innerHTML
const LocationMessageTemplate = document.querySelector('#LocationMessage-template').innerHTML
const roomSidebartemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix:true })

//Autometic Scroll Feature
const autoscroll = ()=>
{
    //new message element
    const $newMessage = $messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of message container
    const containerHeight = $messages.scrollHeight
    
    //How far have I Scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop = $messages.scrollHeight
    }
}

//Welcome message is printing on client side
socket.on('message', (message) => 
{
    console.log(message)
    const html = Mustache.render(messageTemplate,
        {
            username:message.username,
            message:message.text,
            createdAt:moment(message.createdAt).format('h:mm a')
        })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('LocationMessage',(url)=>
{
    console.log(url)
    const html = Mustache.render(LocationMessageTemplate,
        {
            username:url.username,
            url:url.url,
            createdAt: moment(url.createdAt).format('h:mm a')
        })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData',({room, users})=>
{
    console.log(room)
    console.log(users)
    const html = Mustache.render(roomSidebartemplate,
        {
            room,
            users
        })
    document.querySelector('#sidebar').innerHTML=html
})

//Sending message between connected users on Client side
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    //e.target to get in form then .elements to acesss the elements of the form .message is the name of the value provided in input
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message,(error)=>
    {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error)
            {
                return console.log(error)
            }
        console.log('Message Delivered')
    })
    
})

//location algo to get users location and send it to the other users
$messageLocationButton.addEventListener('click', ()=>
{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser.')
    }

    $messageLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position)=>
    {
        console.log(position)
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>
        {
            $messageLocationButton.removeAttribute('disabled')
            console.log('Location Shared!')
        })
    })
})

socket.emit('join', { username, room },(error)=>
{
    if(error)
    {
        alert(error)
        location.href='/'
    }
})