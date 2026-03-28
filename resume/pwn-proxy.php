<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Cache-Control: max-age=300'); // cache 5 min on client

$html = @file_get_contents('https://pwn.college/hacker/zach15james', false,
    stream_context_create(['http' => [
        'method' => 'GET',
        'header' => "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36\r\n",
        'timeout' => 10,
    ]])
);

if (!$html) {
    http_response_code(502);
    echo json_encode(['error' => 'fetch failed']);
    exit;
}

libxml_use_internal_errors(true);
$doc = new DOMDocument();
$doc->loadHTML($html);
$xpath = new DOMXPath($doc);

$dojos = [];

// Each dojo: <a class="text-decoration-none"> containing <h2> + <h4 with <td>s>
$dojoLinks = $xpath->query('//a[contains(@class,"text-decoration-none")]');

foreach ($dojoLinks as $link) {
    $h2nodes = $xpath->query('.//h2', $link);
    if ($h2nodes->length === 0) continue;

    $name = trim($h2nodes->item(0)->textContent);
    $href = $link->getAttribute('href');
    $url  = str_starts_with($href, 'http') ? $href : 'https://pwn.college' . $href;

    $tds  = $xpath->query('.//td', $link);
    $solves = $tds->length > 0 ? trim($tds->item(0)->textContent) : '';
    $rank   = $tds->length > 1 ? trim($tds->item(1)->textContent) : '';

    // Find sibling accordion headers — walk up to parent container then search
    $container = $link->parentNode;
    $modNodes  = $xpath->query('.//div[contains(@class,"accordion-item-header")]', $container);

    $modules = [];
    foreach ($modNodes as $mod) {
        $modNameNodes = $xpath->query('.//*[contains(@class,"accordion-item-name")]', $mod);
        if ($modNameNodes->length === 0) continue;
        $modName = trim($modNameNodes->item(0)->textContent);

        $statNodes = $xpath->query('.//*[contains(@class,"challenge-header-right")]//td', $mod);
        $mSolves = $statNodes->length > 0 ? trim($statNodes->item(0)->textContent) : '';
        $mRank   = $statNodes->length > 1 ? trim($statNodes->item(1)->textContent) : '';

        $modules[] = ['name' => $modName, 'solves' => $mSolves, 'rank' => $mRank];
    }

    $dojos[] = ['name' => $name, 'url' => $url, 'solves' => $solves, 'rank' => $rank, 'modules' => $modules];
}

echo json_encode(['dojos' => $dojos, 'updated' => date('c')]);
