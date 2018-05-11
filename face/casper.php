<?php

$driver = new CasperJs\Driver();
$output = $driver->start('http://teledom.skipodev.ru/')
                 ->run();
echo $output;