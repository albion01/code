<?php
// Serves image files from a "media" folder kept OUTSIDE public_html (one level
// up, beside public_html), so the static-site deploy — which replaces
// public_html — can never wipe them. This script itself lives in the deploy
// archive, so it is always present after a deploy.
//
// Usage: /media.php?f=Joseph%20Erenz.jpg

$dir = __DIR__ . '/../media/';
$f = isset($_GET['f']) ? basename($_GET['f']) : '';      // basename() blocks path traversal
$path = $dir . $f;

$types = array(
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'webp' => 'image/webp',
    'gif'  => 'image/gif',
);
$ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));

if ($f === '' || !isset($types[$ext]) || !is_file($path)) {
    http_response_code(404);
    header('Content-Type: text/plain');
    echo 'Not found';
    exit;
}

header('Content-Type: ' . $types[$ext]);
header('Content-Length: ' . filesize($path));
header('Cache-Control: public, max-age=86400');
readfile($path);
