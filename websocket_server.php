<?php require_once '/var/www/html/function.php';

use Swoole\WebSocket\Server;
use Swoole\WebSocket\Frame;

$server = new Server('194.67.113.16', 9501, SWOOLE_PROCESS, SWOOLE_SOCK_TCP | SWOOLE_SSL);
$server->set(['ssl_cert_file' => '/etc/nginx/ssl/todogram.crt', 'ssl_key_file' => '/etc/nginx/ssl/todogram.key']);
$server->on('message', function (Server $server, Frame $frame) { WebSocket::init($server, $frame); });
$server->start();