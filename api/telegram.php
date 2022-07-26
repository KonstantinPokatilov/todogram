<?php require_once '/var/www/html/function.php';

if (!isset($_REQUEST['token']) || $_REQUEST['token'] != TelegramBot::getToken()) { exit('<div style="height: 100vh; width: calc(100% + 16px); margin: -8px 0px -8px -8px; background: black; color: limegreen; font: 20px/20px monospace; display: flex; justify-content: center; align-items: center;">yxodi psina sytylaya &#128529;<div>'); }

$response = file_get_contents('php://input');
$update = json_decode($response, true);

file_put_contents('telegram.txt', print_r($update, true), FILE_APPEND);

if (mb_substr($update['message']['text'], 0, 19) == 'Активируй компьютер') {
    $fd = (int) trim(str_replace('Активируй компьютер', '', $update['message']['text']));

    $user = User::getUserByTelegramId($update['message']['from']['id']);
    if ($user) {
        $code = User::codeCipher($user['email']);
        $auth_code = User::checkAuthCode(['email' => $user['email'], 'code' => $code, 'cookie_return']);

        // file_put_contents('telegram.txt', $auth_code."\r\n", FILE_APPEND);

        SwooleWebSocket::sendMessage($fd, ['com' => 'resendMessage', 'msg' => ['com' => 'userAuth', 'code' => $auth_code]]);

        // file_put_contents('telegram.txt', $status."\r\n", FILE_APPEND);
    }

    // file_put_contents('telegram.txt', print_r($user, true), FILE_APPEND);
}