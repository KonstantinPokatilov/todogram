'use strict'; console.log('auth script - load')

const auth = {
    email: null,
    code: null,
    init: function() {
        const emailObj = document.querySelector('.auth-form [name="email"]')
        const codeObj = document.querySelector('.auth-form [name="code"]')

        if (emailObj) { this.email = emailObj.value }
        if (codeObj) { this.code = encodeURIComponent(codeObj.value) }
    },
    butSendCode: function() {
        auth.init()
        if (auth.email) {
            fetch('/api/user.php?direction=authForm-email&data=' + JSON.stringify({email: auth.email}))
                .then(res => res.text())
                .then(text => {
                    if (text == true) {
                        document.querySelector('main').setAttribute('com', 'code')
                        document.querySelector('[but="auth-sendCode"]').setAttribute('but', 'auth-checkCode')
                    } else {
                        validation(text)
                    }
                })
        } else { validation('Введите email') }
    },
    butCheckCode: function() {
        auth.init()
        if (!auth.code) { validation('Введите код') }
        if (auth.email && auth.code) {
            fetch('/api/user.php?direction=authForm-code&data=' + JSON.stringify({email: auth.email, code: auth.code}))
                .then(res => res.text())
                .then(text => {
                    if (text == 'true') { location.reload() }
                    else { validation(text) }
                })
        }
    }
}
