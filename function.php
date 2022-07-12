<?php

function q(string $request) {
    $mysqli = new mysqli("localhost", "user", "000", "base");
    
    if ($mysqli->errno) { var_dump($mysqli->error); }

    $query = $mysqli->query($request);
    
    if ($mysqli->insert_id) {
        return $mysqli->insert_id;
    } 
    if ($mysqli->errno) {
        echo $mysqli->error;
    }
    return $query;
}

spl_autoload_register(function($class) {
    $fn = '/var/www/html/classes/'.$class.'.php';
    if (file_exists($fn)) { require $fn; }
});

function shielding(string $query) : string 
{
    return str_replace([ '\\', '"'], ['\\\\', '\"'], $query);

}
