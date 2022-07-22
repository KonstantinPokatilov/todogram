<?php

class WebSocket
{
    private static $server = null;
    private static $frame = null;

    private static $users_fd = [];

    public static function init($server, $frame)
    {
        self::$server = $server;
        self::$frame = $frame;

        $data = json_decode(self::$frame->data, true);

        if ($data['com'] == 'checkUser') {
            self::$users_fd[$data['user_id']] = self::$frame->fd;

            self::sendMessage(self::$users_fd[$data['user_id']], 'pong');
        } else if ($data['com'] == 'sendMessage') {
            self::sendMessage(self::$users_fd[$data['user_id']], $data['text']);
        }
    }

    public static function sendMessage(int $fd, string $message)
    {
        self::$server->push($fd, $message);
    }
}