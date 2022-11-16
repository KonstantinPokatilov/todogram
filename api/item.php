<?php require_once '/var/www/html/function.php';

if (isset($_REQUEST['direction'])) { $direction = $_REQUEST['direction']; } else { exit('false'); }
if (isset($_REQUEST['data'])) { $data = json_decode($_REQUEST['data'], true, JSON_INVALID_UTF8_SUBSTITUTE); }
if (isset($_REQUEST['description'])) { $description = $_REQUEST['description']; }

if ($direction == 'addItems') {

    $itemId = Items::addItem($data);
    echo (json_encode($itemId));

} else if ($direction == 'checkSelect' || $direction == 'checkUnselect') {

    echo(Items::updateCheckbox($data, $direction));

} else if ($direction == 'toggleItem') {
    
    echo (Items::toggleItem($data));

} else if ($direction == 'updateDescription') {

    echo (Items::updateDescription($data['itemId'], $description));
 

} else if ($direction == 'updateItem' || $direction == 'updateDate') {

    echo Items::updateItem($data, $direction);

 }else if ($direction == 'deleteItem') {

    echo Items::delete($data);

}
