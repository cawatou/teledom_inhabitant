<?php
$api_key = 'aoku6smnksfnf7s9jka01qcjx61j8018';
$api_salt = 'ebtbt5o3ouhur0t1atr2atcyq37ptyoy';
$url = 'https://app.mango-office.ru/vpbx/commands/sms';
$data = array(
    "command_id" => "ID" . rand(10000000,99999999),  // идентификатор команды
    "from_extension" => "10", // внутренний номер сотрудника
    "text" => $_REQUEST['code'], // текст смс
    "to_number" => $_REQUEST['phone'], // кому отправить смс
    "sms_sender" => "TELEDOM"  // ОБЯЗАТЕЛЬНЫЙ ПАРАМЕТР. имя отправителя. Если не заполнено - будет использоваться имя отправителя, выбранное в ЛК.
);  
$json = json_encode($data);
$sign = hash('sha256', $api_key . $json . $api_salt);
$postdata = array(
    'vpbx_api_key' => $api_key,
    'sign' => $sign,
    'json' => $json
);
$post = http_build_query($postdata);
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
$response = curl_exec($ch);
curl_close($ch);
echo $response;   // вывести  результат
?>