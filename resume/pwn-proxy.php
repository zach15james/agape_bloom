<?php
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: max-age=300');

$html = @file_get_contents('https://pwn.college/hacker/zach15james', false,
    stream_context_create(['http' => [
        'method'  => 'GET',
        'header'  => "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36\r\n",
        'timeout' => 10,
    ]])
);

if (!$html) {
    echo '<p style="color:#aaa;padding:1rem">Could not load pwn.college profile.</p>';
    exit;
}

// Rewrite root-relative URLs to absolute before DOM parsing
$base = 'https://pwn.college';
$html = preg_replace('/((?:href|src|action)=")\/(?!\/)/', '$1' . $base . '/', $html);
$html = preg_replace('/url\(\'\/(?!\/)/', "url('" . $base . '/', $html);
$html = preg_replace('/url\("\/(?!\/)/', 'url("' . $base . '/', $html);

libxml_use_internal_errors(true);
$doc = new DOMDocument();
$doc->loadHTML('<?xml encoding="UTF-8">' . $html);
$xpath = new DOMXPath($doc);

// Strip individual challenge-level rows
foreach ($xpath->query('//*[contains(@class,"challenge-row")]') as $el) {
    $el->parentNode->removeChild($el);
}

// Strip nav bar
foreach ($xpath->query('//nav') as $el) {
    $el->parentNode->removeChild($el);
}

// Strip footer
foreach ($xpath->query('//footer') as $el) {
    $el->parentNode->removeChild($el);
}

// Inject style: remove body margin/padding so it tiles cleanly in the iframe
$style = $doc->createElement('style', '
    body { margin: 0 !important; padding: 0 !important; }
    .container-fluid > .row > .col { padding-top: 0.5rem !important; }
    /* Disable accordion toggle cursor since challenge rows are gone */
    .challenge-button-2 { pointer-events: none; cursor: default; }
');
$heads = $doc->getElementsByTagName('head');
if ($heads->length) $heads->item(0)->appendChild($style);

// Post-process: iframe resizer message so parent can set height
$script = $doc->createElement('script',
    'window.addEventListener("load",function(){' .
        'parent.postMessage({pwnHeight:document.body.scrollHeight},"*");' .
    '});'
);
$bodies = $doc->getElementsByTagName('body');
if ($bodies->length) $bodies->item(0)->appendChild($script);

echo $doc->saveHTML();
