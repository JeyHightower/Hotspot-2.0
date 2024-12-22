<?php

require __DIR__ . '/../vendor/autoload.php';

use Monolog\Logger;
use Monolog\Handler\StreamHandler;
use Symfony\Component\Console\EventListener\ErrorListener;

$logger = new Logger('hotspot');
$logger->pushHandler(new StreamHandler(__DIR__ . '/../logs/deploy.log', Logger::DEBUG));

$errorListener = new ErrorListener($logger);
