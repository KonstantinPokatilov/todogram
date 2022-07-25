<?php

class SwooleWebSocket
{
    private static $server = null;
    private static $frame = null;

    private static $users_fd = [];

    private static $memcached = null;

    public static function init($server, $frame)
    {
        self::$server = $server;
        self::$frame = $frame;

        if (!self::$memcached) {
            self::$memcached = new Memcached();
            self::$memcached->addServer('localhost', 11211);  
        }

        if (self::$memcached) { self::$users_fd = self::$memcached->get('usersFD'); }

        $data = json_decode(self::$frame->data, true);
        if (!$data) { return false; }

        if ($data['com'] == 'pingUser' && $data['uid']) {
            if (!isset(self::$users_fd[$data['uid']]) || self::$users_fd[$data['uid']] != self::$frame->fd) {
                self::$users_fd[$data['uid']] = self::$frame->fd;

                if (self::$memcached) { self::$memcached->set('usersFD', self::$users_fd); }
            }

            $unread_message = self::checkMessage($data['uid']);

            self::sendMessage(self::$users_fd[$data['uid']], ['com' => 'pingUser', 'text' => 'pong', 'unread' => $unread_message]);
        } else if ($data['com'] == 'sendMessage' && $data['from_uid'] && $data['to_uid'] && $data['text']) {
            self::sendMessage(self::$users_fd[$data['to_uid']], ['com' => 'takeMessage', 'text' => $data['text'], 'from_uid' => $data['from_uid']]);
            self::sendMessage(self::$users_fd[$data['from_uid']], ['com' => 'sendMessage', 'text' => 'send', 'to_uid' => $data['to_uid']]);

            q('INSERT chad_message (text, from_uid, to_uid, create_time) VALUES ("'.shielding($data['text']).'", '.$data['from_uid'].', '.$data['to_uid'].', NOW());');
        }
    }

    public static function sendMessage(int $fd, array $data)
    {
        self::$server->push($fd, json_encode($data));
    }

    public static function checkMessage(int $uid)
    {
        $db = q('SELECT * FROM chad_message_read WHERE uid_to = '.$uid.';');

        $data = [];
        while ($ar = $db->fetch_assoc()) { $data[] = $ar; }

        return $data;
    }
}