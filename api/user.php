<?php require_once '/var/www/html/function.php';

if (isset($_REQUEST['direction'])) { $direction = $_REQUEST['direction']; } else { exit('false'); }
if (isset($_REQUEST['data'])) { $data = json_decode($_REQUEST['data'], true); }

if ($direction == 'authForm-email' && $data) {

    if (isset($data['email'])) { echo User::sendAuthCode($data['email']); }

} else if ($direction == 'authForm-code' && $data) {

    if (isset($data['email']) && isset($data['code'])) { echo User::checkAuthCode($data); }

} else if ($direction == 'exit') {

    echo User::exit();

} else {
    print_r($data);
}