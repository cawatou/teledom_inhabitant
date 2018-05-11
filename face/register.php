<?php

$url = 'https://m.facebook.com/reg/';// ссылка по которой обращаемся к фейсбуку
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
curl_setopt($ch, CURLOPT_REFERER, "https://m.facebook.com/");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// отключаем проверку сертификата
curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate'); // указивает curl что ответ может быть сжат
curl_setopt($ch, CURLOPT_POST, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
//curl_setopt($ch, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл

// получаем HTML код страницы
$html = curl_exec($ch); 
//echo $html;
/*
k: 
ccp: 2
reg_instance: gG29WpPfLEAou3ZJbxPk8YVW
submission_request: true
i: 
helper: 
reg_impression_id: ee8b5881-e19c-360d-0921-cf68322ae59c
ns: 0
field_names[0]: firstname
firstname: Иван
lastname: Васильев
field_names[1]: birthday_wrapper
birthday_day: 17
birthday_month: 6
birthday_year: 1995
field_names[2]: reg_email__
reg_email__: ivanvasilievdota228@yandex.ru
field_names[3]: sex
sex: 2
field_names[4]: reg_passwd__
reg_passwd__: Afta18cadbbba
submit: Регистрация
m_sess: 
fb_dtsg: AQG5066q-_AX:AQGHT6__DBfp
lsd: AVqXS-yT
__dyn: 1Z3p5Bwk8aU4ifVk8y8jXBgryodE4a2i5U4e1Fx-ewpUuwmE6W4o6S0Y8hwv9E660-Ub852q1ew65xmq0GobU
__req: h
__ajax__: AYkuggKJB_9_aTW3O6KuofPDKzVBvL7gwtZtD9P7lKDmg4SqgqHKbAnZB3kpR_fN658dMDdupF29dt5fsR5IlOmJ2HyIfhtSvDoIiIaZluYtug
__user: 0

*/


//
//
$temp = substr(strstr($html, 'name="k" value="'), 16, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['k'] = $temp;
//
$temp = substr(strstr($html, 'name="ccp" value="'), 18, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['ccp'] = $temp;
//
$temp = substr(strstr($html, 'name="reg_instance" value="'), 27, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['reg_instance'] = $temp;
//
$temp = substr(strstr($html, 'name="submission_request" value="'), 33, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['submission_request'] = $temp;
//
$temp = substr(strstr($html, 'name="i" value="'), 16, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['i'] = $temp;
//
$temp = substr(strstr($html, 'name="helper" value="'), 21, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['helper'] = $temp;
//
$temp = substr(strstr($html, 'name="reg_impression_id" value="'), 32, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['reg_impression_id'] = $temp;
//
$temp = substr(strstr($html, 'name="ns" value="'), 17, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['ns'] = $temp;
//////

$post_data['field_names[0]'] = 'firstname';
$post_data['firstname'] = 'Ксения';
$post_data['lastname'] = 'Мигаева';
$post_data['field_names[1]'] = 'birthday_wrapper';
$post_data['birthday_day'] = '11';
$post_data['birthday_month'] = '12';
$post_data['birthday_year'] = '1992';
$post_data['field_names[2]'] = 'reg_email__';
$post_data['reg_email__'] = 'ksenimigae1aai@gmail.com';
$post_data['field_names[3]'] = 'sex';
$post_data['sex'] = '1';
$post_data['field_names[4]'] = 'reg_passwd__';
$post_data['reg_passwd__'] = 'Ksen12fsa3nesk321';
$post_data['submit'] = 'Регистрация';
//////
$temp = substr(strstr($html, 'name="m_sess" value="'), 21, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['m_sess'] = $temp;
//
//$temp = substr(strstr($html, 'name="fb_dtsg" value="'), 22, strlen($html));  
//$temp = stristr($temp, '"', true);
//$post_data['fb_dtsg'] = $temp;

$temp = substr(strstr($html, 'name="lsd" value="'), 18, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['lsd'] = $temp;

foreach ( $post_data as $key => $value) 
{
    $post_items[] = $key . '=' . $value;
	echo $key.' '.$value.'<br>';
}
$post_string = implode ('&', $post_items);


$url = 'https://m.facebook.com/reg/submit/?multi_step_form=1&skip_suma=0&shouldForceMTouch=1';// ссылка по которой обращаемся к фейсбуку
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
curl_setopt($ch, CURLOPT_HEADER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); // следовать за редиректами
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);// таймаут 30 сек
curl_setopt($ch, CURLOPT_REFERER, "https://www.facebook.com/reg/");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// отключаем проверку сертификата
curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate'); // указивает curl что ответ может быть сжат
curl_setopt($ch, CURLOPT_POST, 1); // использовать данные в post
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл

// получаем HTML код страницы
$html = curl_exec($ch); 
echo $html;

?>