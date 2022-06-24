<?php

class User 
{
    private static $ssl_pass = '1111111111111111';

    private static $auth_dir = '/var/www/html/auth/';

    public static function get(array $user = []) : array
    {
        if (!$user) { $user = self::cookieCipher(); }

        if ($user) {
            $userData = q('SELECT * FROM user WHERE email = "'.$user['email'].'";')->fetch_assoc();

            if ($userData) { return $userData; }
        }

        return [];
    }

    public static function add(array $data) : array
    {
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) { return ['novalid email']; }

        if (!$user_data) {
            $userId = q('INSERT INTO user (create_at, pswd, email) VALUES (now(), 1, "'.$data['email'].'");');
            $taskId = q('INSERT INTO task (task_name, user_id) VALUES ("Мои задачи", '.$userId.');');
        }

        $user_data = self::get($data);
        
        if ($user_data['id']) { self::cookieCipher($data, 'write'); }

        return $user_data;
    }

    public static function auth(array $data = []) 
    {
        if (self::get()) { return 'true'; }

        if (isset($data['email']) && isset($data['code'])) {
            $email = $data['email'];
            $code = $data['code'];
        }

        if (!isset($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) { return 'Неправильный email'; }

        if (isset($email)) {
            if (isset($code)) {
                $user = self::get($data);

                $decryptData = self::codeCipher($code, 'decrypt');
                if ($decryptData['email'] == $user['email']) {
                    if (time() - $decryptData['time'] <= 900) {
                        
                        self::cookieCipher($decryptData, 'write');
    
                        return 'true';
                    } else {
                        return 'Срок действия кода истёк';
                    }
                }
                return 'Неверный код';
            }
            return 'Неправильный email';
        
        } else if (self::get($data)) {
            self::sendEmail($data['email'], 'auth to todogram', self::codeCipher($data['email']));

            return 'true';
        }
        return 'Нет доступа';
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

    public static function delete($direction, $taskId)
    {
        if ($user = self::get()) {
                $result = q('DELETE user FROM user WHERE id = "'.$user['id'].'";');

                setcookie('auth', ''); 
        }
    }

    private static function cookieCipher(array $data = [], string $state = 'read') : array
    {
        if ($state == 'write' && $data) {
            $cookie_cipher = openssl_encrypt($data['email'], 'aes-128-cbc', self::$ssl_pass, 0, self::$ssl_pass);
    
            if (setcookie('auth', $cookie_cipher)) {
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

    /*
    public static function checkAuth() : bool
    {
        if (self::get()) { return true; }

        return false;
    }
    */

    public static function sendEmail(string $to, string $subject, string $message) : bool
    {
        return mb_send_mail($to, $subject, $message);
    }
}

