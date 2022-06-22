<?php

class Tasks
{
    public static function addProject(array $data) : string
    {
        if ($user = User::get()) {
        
        $projectId = q('INSERT INTO task (task_name, user_id) VALUES ("'.shielding($data['project']).'", '.$user['id'].');', true);

        return $projectId;

        }
    }

    public static function addItem(array $data = []) : array
    {
        if ($user = User::get()) {
        
            $insertId[] = q('INSERT INTO user_items ( task_id, name) VALUES ("'.$data['taskId'].'", "'.shielding($data['value']).'");');
         
            return $insertId;
        
        }    
    }

    public static function getTasks() : array
    {
        $dataTasks = [];

        if ($user = User::get()) {

            // $db = q('SELECT id, task FROM user_tasks WHERE user_id = '.$user['id'].';');
            $db = q('
                SELECT user_items.id AS item_id, user_items.name AS item_name, task.id AS task_id, task.task_name, user_items.state, user_items.description, task.color, item_date 
                FROM task
                    LEFT JOIN user_items ON user_items.task_id = task.id 
                WHERE task.user_id = '.$user['id'].'
            ;');
            
            if ($db) {
                while ($ar = $db->fetch_assoc()) {
                
                    $dataTasks[$ar['task_id']]['name'] = $ar['task_name'];
                    $dataTasks[$ar['task_id']]['color'] = $ar['color'];
                    $dataTasks[$ar['task_id']]['items'][$ar['item_id']] = [
                        'item_name' => $ar['item_name'],
                        'state' => $ar['state'],
                        'description' => $ar['description'],
                        'date' => $ar['item_date']
                    ];
                }
            }
        }

        return $dataTasks;
    }

    public static function delete(int $taskId, string $isClass) : string
    {   
        if ($isClass == 'delete-project') {
            q('DELETE FROM user_items WHERE task_id = '.$taskId.';');
            q('DELETE FROM task WHERE id = '.$taskId.';');
            return 'project';
        }
        q('DELETE FROM user_items WHERE id = '.$taskId.';');
        return 'true';
    }

    public static function updateCheckbox(string $data, string $direction) : string
    {
        if ($data) {
            if ($direction == 'checkSelect') {
                q('UPDATE user_items SET state = true WHERE id = "'.$data.'";');

                return 'select';
            } 
            q('UPDATE user_items SET state = false WHERE id = "'.$data.'";');

            return 'unselect';
        }   
    }

    public static function updateItem(array $data, string $direction) : string
    {
        if ($data && $direction == 'updateItem') {
            $result = q('UPDATE user_items SET name = "'.shielding($data['value']).'" WHERE id = "'.$data['id'].'";');
            return 'true';    
        } else if ($data && $direction == 'updateDate') {
            $result = q('UPDATE user_items SET item_date = "'.$data['date'].'" WHERE id = "'.$data['id'].'";');
            return 'date'; 
        }
        $result = q('UPDATE task SET task_name = "'.shielding($data['value']).'" WHERE id = "'.$data['id'].'";');
        return 'task';
    }

    public static function updateDescription(array $data) : string
    {
        if ($data) {
            q('UPDATE user_items SET description = "'.shielding($data['description']).'" WHERE id = "'.$data['itemId'].'";');
            return 'true';
        }
    }

    public static function updateColor(array $data) : string
    {
        if ($data) {
            q('UPDATE task SET color = "'.$data['color'].'" WHERE id = "'.$data['projectId'].'";');
        } 
        return 'true';
    }
}
