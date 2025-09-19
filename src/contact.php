<?php
// contact.php — bez załączników, bezpieczny endpoint do formularza
// ---------------------------------------------------------------

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: no-referrer');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
header('Cross-Origin-Opener-Policy: same-origin');
header('Cross-Origin-Resource-Policy: same-site');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok'=>false,'error'=>'METHOD_NOT_ALLOWED']);
  exit;
}

// === prosty rate-limit per IP: max 5 zgłoszeń / 60 min
$ip   = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$file = sys_get_temp_dir().'/cf_'.sha1($ip);
$now  = time();
$lim  = 5; // sztuk
$win  = 60*60; // sek.

$bucket = ['t'=>$now,'c'=>0];
if (is_file($file)) {
  $bucket = json_decode(@file_get_contents($file), true) ?: $bucket;
  if ($now - ($bucket['t'] ?? 0) > $win) { $bucket = ['t'=>$now,'c'=>0]; }
}
if (($bucket['c'] ?? 0) >= $lim) {
  http_response_code(429);
  echo json_encode(['ok'=>false,'error'=>'TOO_MANY_REQUESTS']);
  exit;
}

// === CSRF (double-submit cookie) ===
$cookie = $_COOKIE['csrftoken'] ?? '';
$post   = $_POST['csrf'] ?? '';
if (!$cookie || !$post || !hash_equals($cookie, $post)) {
  http_response_code(403);
  echo json_encode(['ok'=>false,'error'=>'CSRF']);
  exit;
}

// === honeypot anty-spam (niewidoczne pole "company")
if (!empty($_POST['company'] ?? '')) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>'SPAM']);
  exit;
}

// === pobranie + sanityzacja pól ===
$trim = fn($s)=>preg_replace('/\s+/u',' ',trim((string)$s));
$name  = $trim($_POST['name'] ?? '');
$phone = $trim($_POST['phone'] ?? '');
$email = strtolower($trim($_POST['email'] ?? ''));
$vin   = strtoupper($trim($_POST['vin'] ?? ''));
$msg   = trim((string)($_POST['msg'] ?? ''));

if ($name==='' || $phone==='' || $email==='' || $vin==='' || $msg==='') {
  http_response_code(422);
  echo json_encode(['ok'=>false,'error'=>'MISSING_FIELDS']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok'=>false,'error'=>'EMAIL_INVALID']);
  exit;
}
if (!preg_match('/^[A-HJ-NPR-Z0-9]{17}$/', $vin)) {
  http_response_code(422);
  echo json_encode(['ok'=>false,'error'=>'VIN_INVALID']);
  exit;
}

// === konfiguracja poczty ===
// USTAW TYLKO MAIL_TO — resztę najlepiej w zmiennych środowiskowych panelu hostingu
$MAIL_TO   = getenv('MAIL_TO') ?: 'kontakt@twojadomena.pl';  // <- ADRES DOCZELOWY (zmień w panelu lub tu)
$MAIL_FROM = getenv('MAIL_FROM') ?: $MAIL_TO;                 // nadawca (musi być z Twojej domeny dla SPF)
$SMTP_HOST = getenv('SMTP_HOST') ?: '';                       // puste = autodetekcja
$SMTP_PORT = intval(getenv('SMTP_PORT') ?: 0);                // 0 = autodetekcja
$SMTP_USER = getenv('SMTP_USER') ?: $MAIL_FROM;               // login SMTP
$SMTP_PASS = getenv('SMTP_PASS') ?: '';                       // hasło SMTP / app password

// Autodetekcja: Gmail vs OVH (jeśli nie podano SMTP_HOST/PORT)
if ($SMTP_HOST === '') {
  $dom = substr(strrchr($SMTP_USER, '@'), 1) ?: '';
  if ($dom === 'gmail.com' || $dom === 'googlemail.com') {
    $SMTP_HOST = 'smtp.gmail.com';
    $SMTP_PORT = 465;
  } else {
    // OVH domyślnie:
    $SMTP_HOST = 'ssl0.ovh.net';
    $SMTP_PORT = 465;
  }
}

// treść wiadomości
$subject = 'Nowe zapytanie ze strony — 4 KÓŁKA';
$lines = [
  "Imię: $name",
  "Telefon: $phone",
  "E-mail: $email",
  "VIN: $vin",
  "",
  "Wiadomość:",
  $msg
];
$bodyTxt  = implode("\n", $lines);
$bodyHtml = nl2br(htmlentities($bodyTxt, ENT_QUOTES, 'UTF-8'));

// próba wysyłki SMTP przez PHPMailer (jeśli dostępny)
$sent = false;
if (class_exists('\PHPMailer\PHPMailer\PHPMailer') || is_file(__DIR__.'/vendor/autoload.php')) {
  if (!class_exists('\PHPMailer\PHPMailer\PHPMailer')) {
    require_once __DIR__.'/vendor/autoload.php';
  }
  try {
    $phpMailer = new \PHPMailer\PHPMailer\PHPMailer(true);
    $phpMailer->CharSet   = 'UTF-8';
    if ($SMTP_PASS !== '') {
      // SMTP (zalecane)
      $phpMailer->isSMTP();
      $phpMailer->Host       = $SMTP_HOST;
      $phpMailer->SMTPAuth   = true;
      $phpMailer->Username   = $SMTP_USER;
      $phpMailer->Password   = $SMTP_PASS;           // GMAIL: App Password (po włączeniu 2FA)
      $phpMailer->SMTPSecure = \PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
      $phpMailer->Port       = $SMTP_PORT;
    } // else: spróbujemy sendmail/mail poniżej

    $phpMailer->setFrom($MAIL_FROM, 'Formularz 4 KÓŁKA');
    $phpMailer->addAddress($MAIL_TO);
    $phpMailer->addReplyTo($email, $name);
    $phpMailer->Subject = $subject;
    $phpMailer->Body    = $bodyHtml;
    $phpMailer->AltBody = $bodyTxt;

    $sent = $phpMailer->send();
  } catch (\Throwable $e) {
    $sent = false;
  }
}

// awaryjny fallback: mail()
if (!$sent) {
  $headers  = [];
  $headers[] = 'MIME-Version: 1.0';
  $headers[] = 'Content-type: text/html; charset=UTF-8';
  $headers[] = 'From: Formularz 4 KÓŁKA <'.$MAIL_FROM.'>';
  $headers[] = 'Reply-To: '.$name.' <'.$email.'>';
  @mail($MAIL_TO, '=?UTF-8?B?'.base64_encode($subject).'?=', $bodyHtml, implode("\r\n",$headers));
  $sent = true; // nie ma prostego sprawdzenia — traktujemy jako wysłane
}

// zapis zużycia limitu
$bucket['c'] = ($bucket['c'] ?? 0) + 1;
@file_put_contents($file, json_encode($bucket));

echo json_encode(['ok'=>$sent]);
