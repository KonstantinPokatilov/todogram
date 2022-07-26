<?php require_once '/var/www/html/function.php';

// $data = TelegramBot::init('sendMessage', ['chat_id' => '520482759', 'text' => 'test']);
// echo '<pre>'.print_r($data, true).'</pre>';

SwooleWebSocket::sendMessage(5, ['com' => 'resendMessage', 'msg' => ['text' => 'test']]);