<?php require_once '/var/www/html/function.php';

if (isset($_REQUEST['direction'])) { $direction = $_REQUEST['direction']; } else { exit('false'); }
if (isset($_REQUEST['data'])) { $data = json_decode($_REQUEST['data'], true); }
if (isset($_REQUEST['isClass'])) { $isClass = $_REQUEST['isClass']; }

if ($direction == 'getTasks') {
    
    $selectData = Tasks::getTasks();
    echo (json_encode($selectData, JSON_UNESCAPED_UNICODE));
    
} else if ($direction == 'deleteTask') {

    echo Tasks::delete($data, $isClass);

} else if ($direction == 'checkSelect' || $direction == 'checkUnselect') {

    echo(Tasks::updateCheckbox($data, $direction));

} else if ($direction == 'updateItem' || $direction == 'updateTask' || $direction == 'updateDate') {

    echo(Tasks::updateItem($data, $direction));

} else if ($direction == 'addProject') {

    $projectId = Tasks::addProject($data);
    echo (json_encode($projectId, JSON_UNESCAPED_UNICODE));

} else if ($direction == 'addItems') {

    $itemId = Tasks::addItem($data);
    echo (json_encode($itemId));

} else if ($direction == 'updateDescription') {

    echo (Tasks::updateDescription($data));

} else if ($direction == 'updateColor') {

    echo (Tasks::updateColor($data));

} else {
    print_r($data);
}