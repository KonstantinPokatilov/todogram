<?php require_once '/var/www/html/function.php';

if (isset($_REQUEST['direction'])) { $direction = $_REQUEST['direction']; } else { exit('false'); }
if (isset($_REQUEST['data'])) { $data = json_decode($_REQUEST['data'], true); }

if ($direction == 'getTasks') {
    
    $selectData = User::getTasksItems();
    echo (json_encode($selectData, JSON_UNESCAPED_UNICODE));
    
} else if ($direction == 'deleteTask') {

    echo json_encode(Tasks::delete($data));

} else if ($direction == 'updateProject') {

    echo Tasks::updateProject($data);

} else if ($direction == 'addProject') {

    $projectId = Tasks::addProject($data);
    echo (json_encode($projectId, JSON_UNESCAPED_UNICODE));

} else if ($direction == 'updateColor') {

    echo (Tasks::updateColor($data));
    
} else {
    print_r($data);
}