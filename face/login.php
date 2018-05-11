<?php

$login_email = 'fridersadur@gmail.com';
$login_pass = 'fridersadur@gmail.com';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://m.facebook.com/login.php');
curl_setopt($ch, CURLOPT_POSTFIELDS,'charset_test=€,?,€,?,?,Д,Є&email='.urlencode($login_email).'&pass='.urlencode($login_pass).'&login=Login');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept-Charset: utf-8','Accept-Language: en-us,en;q=0.7,bn-bd;q=0.3','Accept: text/xml,application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5')); 
curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл
//curl_setopt($ch, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_USERAGENT, "user_agent");
curl_setopt($ch, CURLOPT_REFERER, "http://m.facebook.com");
$fbMain = curl_exec($ch) or die(curl_error($ch));

$url = 'http://m.facebook.com/home.php?refid=18';
curl_setopt($ch, CURLOPT_URL, $url);
$demo_mac=curl_exec($ch);
//echo $demo_mac;



$number='79522688944';
$url = 'https://www.facebook.com/search/top/?q=%2B'.$number;// ссылка по которой обращаемся к фейсбуку
$ch = curl_init();
$header  = array
(
'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
'Accept-Language: ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
'Accept-Encoding: gzip, deflate', // указываем серверу, что ответ надо сжимать
'Content-type: application/x-www-form-urlencoded'
);
curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
curl_setopt($ch, CURLOPT_URL, $url); // ссылка по которой обращаемся к фейсбуку
curl_setopt ($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); // следовать за редиректами
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);// таймаут 30 сек
curl_setopt($ch, CURLOPT_REFERER, "https://www.facebook.com/reg/");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// отключаем проверку сертификата
curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate'); // указивает curl что ответ может быть сжат
curl_setopt($ch, CURLOPT_POST, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл

// получаем HTML код страницы
$html = curl_exec($ch); 
echo $html;
?>