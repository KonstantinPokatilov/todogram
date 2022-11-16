<?php

class TelegramBot
{
    private static $token = '5510828682:AAFU7MDqUrjhmicKONDpCabmYADVi_1dbQU';
    private static $url = 'https://api.telegram.org/bot<token>/';

    private static $webhook_url = 'https://todogram.space/api/telegram.php';

    private static $method = '';
    private static $method_fields = [];

    public static function init(string $method, array $method_fields = []) : array
    {
        self::$method = $method;
        self::$method_fields = $method_fields;

        self::$url = str_replace('<token>', self::$token, self::$url);

        return json_decode(self::api(), true);
    }

    public static function getToken() : string
    {
        return self::$token;
    }

    private static function api() : string
    {
        $ch = curl_init();

        $url = self::$url.self::$method;

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POSTFIELDS => self::$method_fields
        ]);

        $request = curl_exec($ch);

        curl_close($ch);

        return $request;
    }

    public static function initWebhook() : array
    {
        return self::init('setWebhook', ['url' => self::$webhook_url.'?token='.self::$token]);
    }
}