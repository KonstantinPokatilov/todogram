'use strict'; console.log('main script - load')

const inputs = {}

document.addEventListener('keyup', event => {
    if (event.ctrlKey && event.key == 'z') {
        const name = document.querySelector('[name="email"]')
        if (name) {
            name.focus()
            name.value = 'qwe@qwe.ru'
        }
        butSendForm()
    }
})

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

function butSendForm() {
    const direction = document.querySelector('main').getAttribute('direction')
    const com = document.querySelector('main').getAttribute('com')

    const data = {
        email: document.querySelector('.auth-input').value
    }

    if (direction == 'authForm' && com == 'code') {
        data['code'] = encodeURIComponent(document.querySelector('.input-code').value)
    }
    console.log(data)
    fetch('auth.php?direction=' + direction + '-' + com + '&data=' + JSON.stringify(data))
        .then(res => res.text())
        .then(text => {
            if (com == 'email' && text) { document.querySelector('main').setAttribute('com', 'code') }
            else if (com == 'code' && text) { 
                location.reload() 
            }
        })
}

function addCode() {
  
    document.querySelector('.input-code').focus()
    document.querySelector('.get-code').textContent = 'Войти'

}

const cookie = {
    set: function(name, value, options = {}) {
        let deleteCookieAuth = false
        if (name == 'deleteCookieAuth') {
            deleteCookieAuth = true
    
            name = 'auth'
            value = ''
            options = {'max-age': -1}
        }
    
        options = {
            path: '/',
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
    
        if (deleteCookieAuth) { location.reload() }
    },
    get: function(name) {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
        ));
    
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
}

butListener()