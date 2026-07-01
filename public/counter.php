<?php
// Visitor counter fallback (guaranteed to run on Hostinger's PHP).
// Shares the same counter.dat as the CGI version, kept outside public_html.
// Add ?peek=1 to read the value without incrementing.
header('Content-Type: application/json');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');

$file = __DIR__ . '/../counter.dat';
$peek = isset($_GET['peek']);
$count = 0;

$fp = @fopen($file, 'c+');
if ($fp !== false) {
    flock($fp, LOCK_EX);
    $data = stream_get_contents($fp);
    $count = (int) preg_replace('/\D/', '', (string) $data);
    if (!$peek) {
        $count++;
        rewind($fp);
        ftruncate($fp, 0);
        fwrite($fp, (string) $count);
        fflush($fp);
    }
    flock($fp, LOCK_UN);
    fclose($fp);
} else {
    $count = $peek ? 0 : 1;
}

echo '{"count":' . $count . "}\n";
