<?php require_once '/var/www/html/function.php';

if (isset($_REQUEST['direction'])) { $direction = $_REQUEST['direction']; } else { exit('false'); }
if (isset($_REQUEST['data'])) { $data = json_decode($_REQUEST['data'], true); }

if ($direction == 'getTasks') {
    
    echo (json_encode(User::getTasksItems(), JSON_UNESCAPED_UNICODE));
    
} else if ($direction == 'deleteTask') {

    echo json_encode(Tasks::delete($data));

} else if ($direction == 'updateProject') {

    echo Tasks::updateProject($data);

} else if ($direction == 'addProject') {

    echo json_encode(Tasks::addProject($data), JSON_UNESCAPED_UNICODE);

} else if ($direction == 'updateColor') {

    echo Tasks::updateColor($data);
    
} else {
    print_r($data);
}