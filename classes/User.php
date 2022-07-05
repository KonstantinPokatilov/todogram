<?php

class User 
{
    private static $ssl_pass = '1111111111111111';

    private static $auth_dir = '/var/www/html/auth/';

    public static $data = [];

    public static function get(array $user = []) : array
    {   
        if (self::$data) { return self::$data; }
        
        if (!$user) { $user = self::cookieCipher(); }

        if ($user) {
            self::$data = q('SELECT * FROM user WHERE email = "'.$user['email'].'";')->fetch_assoc();
        }

        return self::$data;
    }

    public static function sendAuthCode(string $email) : string
    {   
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { return 'Некорректный email'; }

        if ($user = self::get(['email' => $email])) {
            return self::sendEmail($email, 'auth to todogram', self::codeCipher($email));
        }
        return 'Нет доступа';
    }

    public static function checkAuthCode(array $data) : string
    {
        if (!isset($data['email']) || !isset($data['code'])) { return 'Введены неверные данные'; }

        if ($user = self::get(['email' => $data['email']])) {
            $decryptData = self::codeCipher($data['code'], 'decrypt');

            if ($decryptData['email'] == $user['email']  && $_SERVER['REMOTE_ADDR'] == $decryptData['ip']) {
                self::cookieCipher($user, 'write');

                return 'true';
            }
        }

        return 'false';
    }

    public static function sendEmail(string $to, string $subject, string $message) : bool
    {
        return mb_send_mail($to, $subject, $message);
    }

    public static function auth(array $data = []) 
    {
        if (self::get()) { return 'true'; }
    }

    public static function codeCipher(string $text, string $command = 'encrypt') 
    {
        if ($command == 'encrypt') {
            $data = [
                'email' => $text,
                'ip' => $_SERVER['REMOTE_ADDR'],
                'time' => time()
            ];

            return openssl_encrypt(json_encode($data), 'aes-128-cbc', self::$ssl_pass, 0, self::$ssl_pass);

        } else if ($command == 'decrypt') {
           
            return json_decode(openssl_decrypt($text, 'aes-128-cbc', self::$ssl_pass, 0, self::$ssl_pass), true);
        }
    }

    public static function exit() : bool
    {
        if (isset($_COOKIE['auth'])) {
            unset($_COOKIE['auth']);
            setcookie('auth', '', -1, '/');
            return true;
        }
        return false;
    }

    private static function cookieCipher(array $data = [], string $state = 'read') : array
    {
        if ($state == 'write' && $data) {
            $cookie_cipher = openssl_encrypt($data['email'], 'aes-128-cbc', self::$ssl_pass, 0, self::$ssl_pass);
    
            if (setcookie('auth', $cookie_cipher, time() + 60 * 60 * 24 * 365, '/', '', '', true)) {
                return [true];
            }
        } else if ($state == 'read' && isset($_COOKIE['auth'])) {
            $cookie_cipher = openssl_decrypt($_COOKIE['auth'], 'aes-128-cbc', self::$ssl_pass, 0, self::$ssl_pass);

            if ($cookie_cipher) {
                return [
                    'email'=> $cookie_cipher,
                ]; 
            }
        }

        return [];
    }

    public static function getTasksItems() : array
    {   
        self::get();
        $items = Items::get();
        $tasks = Tasks::get();

        foreach($tasks as $task_id => $task_value) {
            if (isset($task_value['items'])) {
                $tasks[$task_id]['items'] = array_intersect_key($items, $task_value['items']);
            }
        }

        if (self::$data['role'] == 'admin') { $tasks = ['user' => self::$data['role'], 'projects' => $tasks]; }

        return $tasks;
    }
}

