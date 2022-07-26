'use strict'; console.log('main script - load')

const inputs = {}

function setCookie(name, value, options = {}) {

    options = {
      path: '/',
      // при необходимости добавьте другие значения по умолчанию
      ...options
    };
  
    if (options.expires instanceof Date) {
      options.expires = options.expires.toUTCString();
    }
  
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
    for (let optionKey in options) {
      updatedCookie += "; " + optionKey;
      let optionValue = options[optionKey];
      if (optionValue !== true) {
        updatedCookie += "=" + optionValue;
      }
    }
  
    document.cookie = updatedCookie;
}

function inputsEventListener() {
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('keyup', event => {
            if (event.key == 'Enter') {
                input.dispatchEvent(new Event('blur'))
                if (document.querySelector('main[com="email"]')) { 
                    auth.butSendCode() 
                } else if (document.querySelector('main[com="code"]')) {
                    auth.butCheckCode() 
                }
            }
            if (event.ctrlKey && event.key == 'z') {
                const name = document.querySelector('[name="email"]')
                if (name) {
                    name.focus()
                    name.value = 'PokatilovK@vlfarm.ru'
                }
            }
        })
    })
}

function butListener() {
    document.querySelectorAll('[but]').forEach(but => {
        if (!('listenerClick' in but)) {
            but.addEventListener('click', event => {
                const butName = but.getAttribute('but')
                if (butName.includes('-')) {
                    const butNameSplit = butName.split('-')

                    const butFunc = 'but' + capitalizeFirstLetter(butNameSplit[1])
                    eval(butNameSplit[0])[butFunc].call(but)
                } else {
                    const butFunc = 'but' + capitalizeFirstLetter(butName)
            
                    if (butFunc in window) { 
                        window[butFunc].call(but)
                    }
                }
            })

            but['listenerClick'] = true;
        }
    })
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function validation(text) {
    popUp.add(text, 'bottom', 'time')
}

function overflow() {
    const direction = document.querySelector('main[direction]') 
    if (direction) {
        document.querySelector('body').style.overflow = 'hidden'
    }    
}

const popUp = {
    
    time: 2000,
    types: { time: 'time', btn: 'btn', closing: 'cls' },

    positions: {top: 'pop-top', right: 'pop-right', bottom: 'pop-bottom', left: 'pop-left', center: 'pop-center'},

    popUpContainer: null,

    maket: `<div class="notice"></div>
            <div class="notice-description"></div>`,

    buttons: `<div class="pop-buttons">
                <div class="pop-button" but="popUp-popUpOk">Ок</div>
                <div class="pop-button" but="popUp-popUpNot">Не ок</div>
            </div>`,

    close: `<div class="pop-buttons" but="popUp-closePopUp">
                <div class="pop-button">Ок</div>
            </div>`,
   
    init: function() {
        this.popUpContainer = document.querySelector('.pop-up-container')

        if (this.popUpContainer) {
            this.popUpContainer.querySelector('.notice').innerText = ''
        } else {
            this.popUpContainer = document.createElement('div')
            this.popUpContainer.classList.add('pop-up-container')
            this.popUpContainer.innerHTML = popUp.maket

            document.querySelector('body').insertAdjacentElement('beforeend', this.popUpContainer)
        }
    },

    add: function(text, positionCommand, type) {     
        this.init()

        const position = {}

        const positionCommandSlice = positionCommand.split('-')
        
        if (positionCommand == 'center') {
            this.popUpContainer.style.top = '40%'
            this.popUpContainer.style.left = 'calc(50% - 310px)'
            this.popUpContainer.style.width = '600px'
            this.popUpContainer.style.height = '240px'
            this.popUpContainer.style.opacity = '0'
        } else if (positionCommandSlice.length == 2) {
            position.x = positionCommandSlice[0]
            position.y = positionCommandSlice[1]

            this.popUpContainer.style[position.x] = '0px'
            this.popUpContainer.style[position.y] = '-'+ (this.popUpContainer.clientWidth + 10) +'px'
        } else {
            position.x = positionCommandSlice[0]
            position.x == 'left' || position.x == 'right' ? position.y = 'top' : position.y = 'left'        
            this.popUpContainer.style[position.x] = '-'+ (this.popUpContainer.clientWidth + 10) +'px'
            this.popUpContainer.style[position.y] = 'calc(50% - 150px)'
    
        }

        setTimeout(() => {
            if (positionCommand == 'center') {
                this.popUpContainer.style.opacity = '1'
            } else if (positionCommandSlice.length == 2) {
                this.popUpContainer.style[position.x] = '0px'
                this.popUpContainer.style[position.y] = '10px'
            } else if (positionCommandSlice.length == 1) {
                this.popUpContainer.style[position.x] = '10px'
            }
        }, 0)
        
        const deleteButton = () => { 
            let popUpButtons = null
            if ( popUpButtons = this.popUpContainer.querySelector('.pop-buttons')) { popUpButtons.remove() } 
        }

        if (type == 'time') {
            setTimeout(() => {
                if (positionCommandSlice.length == 2) {
                    this.popUpContainer.style[position.x] = '0px'
                    this.popUpContainer.style[position.y] = '-'+ (this.popUpContainer.clientWidth + 10) +'px'    
                } else if (positionCommandSlice.length == 1) {
                    this.popUpContainer.style[position.x] = '-'+ (this.popUpContainer.clientWidth + 10) +'px'
                }
            }, this.time)
            
        } else if (type == 'btn') { 
            deleteButton()
            this.popUpContainer.insertAdjacentHTML('beforeend', popUp.buttons) 
        } else if (type == 'cls') { 
            deleteButton()
            this.popUpContainer.insertAdjacentHTML('beforeend', popUp.close) 
        }

        this.popUpContainer.querySelector('.notice').innerText = text

        butListener()
    },

    butClosePopUp: function() {
        this.parentElement.remove()
    },

    butPopUpOk: function() {
        console.log('Ок')
    },

    butPopUpNot: function() {
        console.log('Не ок!')
    },
}

overflow()
butListener()
inputsEventListener()

// https://learn.javascript.ru/websocket
// инициализируется в user.getAllUsers() потому что нам нужен user

const mainWebSocket = {
    socket: null,
    ping: {
        time: null,
        timeout: 10,
        intervalId: null
    },
    error: {
        event: null,
        count: 0,
        maxCount: 9,
        timeout: 10
    },
    computerID: null,
    init: function(com = 'pingUser') {
        this.socket = new WebSocket('wss://todogram.space:9501')

        this.socket.onopen = () => {
            if (com == 'pingUser') {
                this.pingUser()
                this.ping.intervalId = setInterval(() => { mainWebSocket.pingUser() }, mainWebSocket.ping.timeout * 1000)
            } else if (com == 'pingComputer') {
                this.sendMessage(JSON.stringify({
                    com: 'pingComputer'
                }))
            }
        }

        this.socket.onerror = event => { this.error.event = event }
        this.socket.onmessage = event => { this.takeMessage(event) }
        this.socket.onclose = () => { this.close(true) }
    },
    sendMessage: function(text) {
        if (typeof text == 'object') { text = JSON.stringify(text) }

        this.socket.send(text)
    },
    takeMessage: function(event) {
        const data = JSON.parse(event.data)

        if (data.com == 'pingUser' && data.text == 'pong') { this.ping.time = Date.now() }
        else if (data.com == 'takeMessage') { chad.addMessage({text: data.text, from_uid: data.from_uid}) }
        else if (data.com == 'pingComputer' && 'computerID' in data) {
            this.computerID = data.computerID
            this.auth()
        } else if (data.com == 'userAuth' && 'code' in data) {
            setCookie('auth', data.code, {secure: true, 'max-age': 31536000})
            location.reload()
        }
    },
    close: function(restart = false) {
        if (this.ping.intervalId) { clearTimeout(this.ping.intervalId) }

        if (restart) {
            if (this.error.event && this.error.count < this.error.maxCount) {
                setTimeout(() => {
                    mainWebSocket.init()
                    mainWebSocket.error.count += 1
                }, this.error.timeout * 1000)
            } else {
                mainWebSocket.init()
            }
        }
    },
    pingUser: function() {
        this.sendMessage(JSON.stringify({
            com: 'pingUser',
            uid: user.id
        }))
    },
    auth: function() {
        const authInfoText = document.querySelector('.auth-info-text')
        if (!authInfoText) { return false }

        const authInfoTextActivate = document.createElement('div')
        authInfoTextActivate.classList.add('auth-info-text-activate')
        authInfoTextActivate.innerText = 'Активируй компьютер '+ this.computerID

        authInfoTextActivate.onclick = event => navigator.clipboard.writeText(event.target.innerText)

        authInfoText.append(authInfoTextActivate)
    }
}