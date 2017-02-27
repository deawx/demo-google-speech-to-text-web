<?php

define('ROOT_PATH', dirname(__FILE__));
require_once ROOT_PATH . '/vendor/autoload.php';

use Google\Cloud\ServiceBuilder;
use Google\Cloud\ExponentialBackoff;

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES)) {
    $text = '';

    //call google speech api
    putenv('GOOGLE_APPLICATION_CREDENTIALS=' . ROOT_PATH . '/gscloud.json');
    $client = new \Google_Client();
    $client->useApplicationDefaultCredentials();
    $client->authorize();

    $text = transcribe_sync($_FILES['audio-blob']['tmp_name'], [
        'encoding' => 'LINEAR16',
        'sampleRate' => 44100,
        'languageCode' => 'vi-VN'
    ]);

    header('Content-Type: application/json');
    echo json_encode([
        'text' => $text
    ]);
}

function transcribe_sync($audioFile, $options = [])
{
    $builder = new ServiceBuilder();
    $speech = $builder->speech();
    $results = $speech->recognize(
        fopen($audioFile, 'r'),
        $options
    );

    if ($results) {
        return $results[0]['transcript'];
    } else {
        return [];
    }
}
