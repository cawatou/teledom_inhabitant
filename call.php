<?if(isset($_REQUEST['to_number'])):
    $api_key = 'aoku6smnksfnf7s9jka01qcjx61j8018';
    $api_salt = 'ebtbt5o3ouhur0t1atr2atcyq37ptyoy';
    $url = 'https://app.mango-office.ru/vpbx/commands/callback';
    $data = array(
        "command_id" => "your-command-id",
        "from" => array(
            "extension" => "10",
            "number" => "78123325307"
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
    <form id="call" action="call.php" method="post">
        <input type="text" placeholder="Введите номер телефона" id="to_number" name="to_number" value="">
        <input type="submit" value="Отправить">
    </form>

<div class="mango-call-site" data-options='{"host": "widgets.mango-office.ru/", "id": "MTAwMDgxNzQ=", "errorMessage": "В данный момент наблюдаются технические проблемы и совершение звонка невозможно"}'>
	<a href="#">Позвонить онлайн</a>
</div>
<script>!function(t){function e(t){options=JSON.parse(t.getAttribute("data-options")),t.querySelector("button, a").setAttribute("onClick","window.open('https://"+options.host+"widget/call-from-site-auto-dial/"+options.id+"', '_blank', 'width=238,height=400,resizable=no,toolbar=no,menubar=no,location=no,status=no'); return false;")}for(var o=document.getElementsByClassName(t),n=0;n<o.length;n++){var i=o[n];if("true"!=o[n].getAttribute("init")){options=JSON.parse(o[n].getAttribute("data-options"));var a=document.createElement("link");a.setAttribute("rel","stylesheet"),a.setAttribute("type","text/css"),a.setAttribute("href",window.location.protocol+"//"+options.host+"css/widget-button.css"),a.readyState?a.onreadystatechange=function(){("complete"==this.readyState||"loaded"==this.readyState)&&e(i)}:(a.onload=e(i),a.onerror=function(){options=JSON.parse(i.getAttribute("data-options")),i.querySelector("."+t+" button, ."+t+" a").setAttribute("onClick","alert('"+options.errorMessage+"');")}),(i||document.documentElement).appendChild(a),i.setAttribute("init","true")}}}("mango-call-site");</script>

<?endif?>
