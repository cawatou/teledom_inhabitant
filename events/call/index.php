<?php
$callid=$_POST['sign'];

$fp = fopen('callid.txt', 'a+'); 
fwrite($fp, "PAH---".$callid."\r\n");
fclose($fp);