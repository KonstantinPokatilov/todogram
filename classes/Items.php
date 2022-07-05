<?php

class Items {

    public static $data = [];

    public static function get(int $user_id = 0) : array
    {
        if (User::$data) { $user = User::$data; }
        if (!$user_id && isset($user['id'])) { $user_id = $user['id']; }

        $items = q('SELECT * FROM relations_user_item LEFT JOIN items ON relations_user_item.item_id = items.id where user_id = '.$user_id.'');
        
        if (isset($items)) { 
            while ($itemsAr = $items->fetch_assoc()) {
                
                self::$data[$itemsAr['id']] = [
                    'name' => $itemsAr['name'],
                    'description' => $itemsAr['description'],
                    'date' => $itemsAr['date'],
                    'state' => $itemsAr['state'],
                    'id' => $itemsAr['id']
                ];
            }
        }

        return self::$data;
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

    public static function updateDescription(array $data) : string
    {
        if ($data) {
            q('UPDATE items SET description = "'.shielding($data['description']).'" WHERE id = "'.$data['itemId'].'";');
            return 'true';
        }
    }

    public static function toggleItem(array $data) : bool
    {
        $result = q('UPDATE relations_item_task SET task_id = "'.$data['projectId'].'" WHERE item_id = "'.$data['itemId'].'";');
        if ($result) {
            return true;
        }
    }

    public static function updateItem(array $data, string $direction) : string
    {
        if ($data && $direction == 'updateItem') {
            $result = q('UPDATE items SET name = "'.shielding($data['value']).'" WHERE id = "'.$data['id'].'";');
            return 'true';    
        } else if ($data && $direction == 'updateDate') {
            $result = q('UPDATE items SET date = "'.$data['date'].'" WHERE id = "'.$data['id'].'";');
            return 'date'; 
        }
    }

    public static function delete(int $item_id) : bool
    {   
        $user = User::get();
        $relations = [];
        $res = q('SELECT user_id FROM relations_user_item WHERE item_id = '.$item_id.';');
        while ($relItems = $res->fetch_assoc()) { $relations[] = $relItems; }

        if (count($relations) > 1) {
            q('DELETE FROM relations_user_item WHERE item_id = '.$item_id.' AND user_id = '.$user['id'].';');
            return true;
        }
        
        q('DELETE items, relations_user_item, relations_item_task 
            FROM items 
                INNER JOIN relations_user_item 
                INNER JOIN relations_item_task 
            WHERE items.id = '.$item_id.' 
                AND relations_user_item.item_id = '.$item_id.' 
                AND relations_item_task.item_id = '.$item_id.';');
        return true;
    }
}