<?php require_once '/var/www/html/function.php';

if (isset($_REQUEST['direction'])) { $direction = $_REQUEST['direction']; } else { exit('false'); }
if (isset($_REQUEST['data'])) { $data = json_decode($_REQUEST['data'], true); }

if ($direction == 'authForm-email' && $data) {

    echo User::auth($data);

} else if ($direction == 'authForm-code' && $data) {

    echo User::auth($data);

} else if ($direction == 'delete') {

    echo User::delete($direction);

} else {
    print_r($data);
}