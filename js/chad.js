'use strict'; console.log('chad script - load')

// инициализируется в user.getAllUsers() потому что нам нужен user

const chad = {
    dom: null,
    init: function() {
        this.initDOM()
    },
    initDOM: function() {
        this.dom = document.querySelector('.chad')

        if (!this.dom) {
            this.dom = document.createElement('div')
            this.dom.classList.add('chad')
            this.dom.style.display = 'none'
            this.dom.innerHTML = `
                <div class="chad-button"></div>
                <div class="chad-container">
                    <div class="chad-container-user-list" name="Выбрать пользователя"></div>
                    <div class="chad-container-message-list"></div>
                    <div class="chad-container-input"><input></div>
                </div>
            `
            document.querySelector('body').append(this.dom)

            const chadContainerUserList = this.dom.querySelector('.chad-container-user-list')
            const chadContainerMessageList = this.dom.querySelector('.chad-container-message-list')
            const chadContainerInput = this.dom.querySelector('.chad-container-input input')

            if (!document.querySelector('head link[rel="stylesheet"][href="css/chad.css"]')) {
                const style = document.createElement('link')
                style.setAttribute('rel', 'stylesheet')
                style.setAttribute('href', 'css/chad.css')
    
                document.querySelector('head').append(style)
                style.onload = () => { this.dom.removeAttribute('style') }
            }

            this.dom.querySelector('.chad-button').onclick = event => {
                this.dom.classList.toggle('show')
                chadContainerInput.focus()
            }

            chadContainerUserList.onclick = event => {

                chadContainerMessageList.innerHTML = ''

                for (const userId in user.users) {
                    const userSelectDom = document.createElement('div')
                    userSelectDom.classList.add('chad-container-message-list-user-select')

                    userSelectDom.setAttribute('user-id', userId)
                    userSelectDom.setAttribute('user-name', user.users[userId].name)
                    userSelectDom.setAttribute('user-email', user.users[userId].email)

                    userSelectDom.innerHTML = user.users[userId].name + ' [' + user.users[userId].email + ']'

                    userSelectDom.onclick = event => {
                        chadContainerUserList.setAttribute('id', event.target.getAttribute('user-id'))
                        chadContainerUserList.setAttribute('name', event.target.getAttribute('user-name'))
                        chadContainerUserList.setAttribute('email', event.target.getAttribute('user-email'))

                        chadContainerMessageList.innerHTML = ''

                        chadContainerInput.focus()
                    }

                    chadContainerMessageList.append(userSelectDom)
                }
            }

            chadContainerInput.onkeyup = event => {
                if (event.which == 13) {
                    const sendData = {
                        com: 'sendMessage',
                        from_uid: user.id,
                        to_uid: chadContainerUserList.getAttribute('id'),
                        text: chadContainerInput.value
                    }

                    mainWebSocket.sendMessage(sendData)
                    this.addMessage({text: chadContainerInput.value, from_uid: user.id})

                    chadContainerInput.value = ''
                }
            }
        }
    },
    addMessage: function(data) {
        const chadContainerMessageList = this.dom.querySelector('.chad-container-message-list')
        const chadContainerUserList = this.dom.querySelector('.chad-container-user-list')

        if (data.text) {
            const message = document.createElement('div')
            message.classList.add('chad-container-message-list-message')
            message.innerText = data.text

            if (data.from_uid == user.id) { message.setAttribute('me', '') }

            chadContainerMessageList.append(message)

            if (data.from_uid in user.users) {
                chadContainerUserList.setAttribute('id', data.from_uid)
                chadContainerUserList.setAttribute('name', user.users[data.from_uid].name)
                chadContainerUserList.setAttribute('email', user.users[data.from_uid].email)
            }
        }

        chadContainerMessageList.scrollTo({
            top: chadContainerMessageList.scrollHeight,
            behavior: 'smooth'
        });
    }
}