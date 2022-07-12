<?php

class Tasks
{
    public static function addProject(array $data) : string
    {
        if ($user = User::get()) {
        
        $projectId = q('INSERT INTO task (name, user_id) VALUES ("'.shielding($data['project']).'", '.$user['id'].');', true);

        return $projectId;

        }
    }

    public static function get(int $user_id = 0) : array
    {
        if (User::$data) { $user = User::$data; }
        if (!$user_id && isset($user['id'])) { $user_id = $user['id']; }
        
        $dataItems = Items::get($user_id);

        $all = [];

        if (!empty($dataItems)) {
            $relation = q('SELECT * FROM relations_item_task where item_id IN ('.implode(',', array_keys($dataItems)).');');
            
            if (isset($relation)) { 
                while ($rel = $relation->fetch_assoc()) {     
                    $all[$rel['task_id']]['items'][$rel['item_id']] = '';           
                }
            }
        }      
        
        $tasks = q('SELECT * FROM task where user_id = '.$user_id.';');
        if (isset($tasks)) { 
            while ($tasksAr = $tasks->fetch_assoc()) {
                $all[$tasksAr['id']]['name'] = $tasksAr['name'];
                $all[$tasksAr['id']]['color'] = $tasksAr['color'];   
            }
        }
        return $all;
    }

    public static function delete(int $taskId) : array
    {   
        $relations = [];
        $res = q('SELECT item_id FROM relations_item_task WHERE task_id = '.$taskId.';');
        while ($relTask = $res->fetch_assoc()) { $relations[$relTask['item_id']] = $relTask['item_id']; }

        foreach($relations as $key => $value) {
            Items::delete($key);
        }

        q('DELETE FROM task WHERE id = '.$taskId.';');
        // q('DELETE FROM relations_item_task WHERE task_id = '.$taskId.';');
        return $relations;
    }

    public static function updateProject(array $data) : bool
    {
        $result = q('UPDATE task SET name = "'.shielding($data['value']).'" WHERE id = "'.$data['id'].'";');
        return true;
    }

    public static function updateColor(array $data) : string
    {
        if ($data) {
            q('UPDATE task SET color = "'.$data['color'].'" WHERE id = "'.$data['projectId'].'";');
        } 
        return 'true';
    }

}
