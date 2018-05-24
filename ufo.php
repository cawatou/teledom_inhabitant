<?if(isset($_REQUEST['to_number'])):
    $api_key = 'aoku6smnksfnf7s9jka01qcjx61j8018';
    $api_salt = 'ebtbt5o3ouhur0t1atr2atcyq37ptyoy';
    $url = 'https://app.mango-office.ru/vpbx/commands/callback';
    $data = array(
        "command_id" => "your-command-id",
        "from" => array(
            "extension" => "12",
            "number" => "78126158596"
        ),
        "to_number" => $_REQUEST['to_number']
    );

    $json = json_encode($data);

    $sign = hash('sha256', $api_key . $json . $api_salt);

    $postdata = array(
        'vpbx_api_key' => $api_key,
        'sign' => $sign,
        'json' => $json
    );

    $post = http_build_query($postdata);

    $opts = array(
        'http' => array(
            'method' => 'POST',
            'header' => 'Content-type: application/x-www-form-urlencoded',
            'content' => $post
        )
    );
    $context = stream_context_create($opts);
    $response = file_get_contents($url, false, $context);

    echo $response;
else:?>
    <form id="call" action="ufo.php" method="post">
        <input type="text" placeholder="Введите номер телефона" id="to_number" name="to_number" value="">
        <input type="submit" value="Отправить">
    </form>
<?endif?>
