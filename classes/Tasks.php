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
            $projId = 0;

            $insertId = q('INSERT INTO items (name) VALUES ("'.shielding($data['value']).'");');
            q('INSERT INTO relations_user_item (item_id, user_id) VALUES ('.$insertId.', '.$user['id'].');');

            if ($data['projectId']) { $projId = $data['projectId']; }

            q('INSERT INTO relations_item_task (task_id, item_id) VALUES ('.$projId.', "'.$insertId.'");');
            return [$insertId];
        
        }    
    }

    public static function getTasks() : array
    {

        if ($user = User::get()) {

            $dataItems = [];
            $items = q('SELECT * FROM relations_user_item LEFT JOIN items ON relations_user_item.item_id = items.id where user_id = '.$user['id'].'');

            if (isset($items)) { 
                while ($itemsAr = $items->fetch_assoc()) {
                    
                    $dataItems[$itemsAr['id']] = ['name' => $itemsAr['name'],
                        'description' => $itemsAr['description'],
                        'item_date' => $itemsAr['item_date'],
                        'state' => $itemsAr['state'],
                        'user' => $itemsAr['user_id']];
                }
            }
            
            $relAr = [];
            if (!empty($dataItems)) {
                $relation = q('SELECT * FROM relations_item_task where item_id IN ('.implode(',', array_keys($dataItems)).')');
                
                if (isset($relation)) { 
                    while ($rel = $relation->fetch_assoc()) {     

                        $relAr[] = [
                            'task_id' => $rel['task_id'],
                            'item_id' => $rel['item_id']
                        ];
                    }
                }
            }
            

            $dataTask = [];

            $tasks = q('SELECT * FROM task where user_id = '.$user['id'].'');
            
            if (isset($tasks)) { 
                while ($tasksAr = $tasks->fetch_assoc()) {
                    $dataTask[$tasksAr['id']] = ['id' => $tasksAr['id'],
                    'name' => $tasksAr['task_name'],
                    'color' => $tasksAr['color']];
                }
            }

            $all = [];

            for ($i = 1; $i <= count($dataTask); $i++) {
                for($a = 0; $a < count($relAr); $a++) {
                    if ($dataTask[$i]['id'] == $relAr[$a]['task_id']) {
                        $dataTask[$i]['items'][$relAr[$a]['item_id']] = $dataItems[$relAr[$a]['item_id']];
                    }
                }
            }
            for ($i = 0; $i < count($relAr); $i++) {
                if ($relAr[$i]['task_id'] == 0) {
                    $dataTask[0]['items'][$relAr[$i]['item_id']] = $dataItems[$relAr[$i]['item_id']];
                }
            }

            // foreach($relAr as $taskKey => $itemsArr) {
            //     foreach($dataItems as $itemKey => $itemvalue) {
            //         foreach($itemsArr as $itkey => $itValue) {
            //             if (isset($dataTask)) {
            //                 foreach($dataTask as $key => $value) {
            //                     $all[$key] = $value;
            //                     if ($taskKey == $key && $itemKey == $itValue) {
            //                         $all[$key]['items'] = [$itemKey => $itemvalue];
            //                     } 
                               
            //                 }
            //             } 
            //             if ($taskKey == 0 && $itemKey == $itValue) {
            //                 $all[$taskKey]['items'][$itemKey] = $itemvalue;
            //             } 
            //         } 
            //     }
            // }

            if ($user['role'] == 'admin') { $dataTask = ['user' => $user['role'], 'projects' => $dataTask]; }
            return $dataTask;
        }   
    }

    public static function delete(int $taskId, string $isClass) : string
    {   
        if ($isClass == 'delete-project') {
            q('DELETE FROM task WHERE id = '.$taskId.';');
            q('DELETE FROM relations_item_task WHERE task_id = '.$taskId.';');
            return 'project';
        }
        q('DELETE FROM items WHERE id = '.$taskId.';');
        q('DELETE FROM relations_item_task WHERE item_id = '.$taskId.';');
        q('DELETE FROM relations_user_item WHERE item_id = '.$taskId.'');
        return 'true';
    }

    public static function updateCheckbox(string $data, string $direction) : string
    {
        if ($data) {
            if ($direction == 'checkSelect') {
                q('UPDATE items SET state = true WHERE id = "'.$data.'";');

                return 'select';
            } 
            q('UPDATE items SET state = false WHERE id = "'.$data.'";');

            return 'unselect';
        }   
    }

    public static function updateItem(array $data, string $direction) : string
    {
        if ($data && $direction == 'updateItem') {
            $result = q('UPDATE items SET name = "'.shielding($data['value']).'" WHERE id = "'.$data['id'].'";');
            return 'true';    
        } else if ($data && $direction == 'updateDate') {
            $result = q('UPDATE items SET item_date = "'.$data['date'].'" WHERE id = "'.$data['id'].'";');
            return 'date'; 
        }
        $result = q('UPDATE task SET task_name = "'.shielding($data['value']).'" WHERE id = "'.$data['id'].'";');
        return 'task';
    }

    public static function updateDescription(array $data) : string
    {
        if ($data) {
            q('UPDATE items SET description = "'.shielding($data['description']).'" WHERE id = "'.$data['itemId'].'";');
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

    public static function toggleItem(array $data) : bool
    {
        $result = q('UPDATE relations_item_task SET task_id = "'.$data['projectId'].'" WHERE item_id = "'.$data['itemId'].'";');
        if ($result) {
            return true;
        }
    }
}
