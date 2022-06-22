<?php require_once 'function.php';

$main = '<main direction="authForm" com="email">
    <div class="auth-logo">
        <img src="css/img/Vector.svg" class="icon-vec" alt="#">
        <img src="css/img/todogram-auth.svg" class="todogram-auth" alt="#">
    </div>
    <div>
        <img src="css/img/main-logo.svg" class="main-logo" alt="#">
    </div >
    <div class="auth-form">
        <input type="email" name="email" placeholder="Введите ваш корпоративный email" class="auth-input">
        <input type="text" name="code" placeholder="Введите код" class="auth-input input-code"></input>
        <div but="sendForm">
            <img src="css/img/Vector-get.svg" alt="#">
            <div class="get-code">Получить код</div>    
        </div>
    </div>
    <div class="footer">
        <img src="css/img/question-circle.svg" alt="#">
        <div class="footer-help">Помощь</div>
    </div>
    </main>';

$script = '<script src="/js/main.js"></script>';

if (User::auth()) { require_once 'content.php'; }

echo '<!DOCTYPE html>
<html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" href="css/style.css">
    </head>
    <body>
        '.$main.'
        '.$script.'
    </body>
</html>';