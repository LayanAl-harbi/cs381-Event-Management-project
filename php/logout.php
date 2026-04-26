<?php
session_start();

/* Remove all session variables */
$_SESSION = [];

/* Remove the session cookie */
if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

/* Destroy the session */
session_destroy();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Logging out...</title>
  <meta http-equiv="refresh" content="1; url=../pages/login.html" />
</head>
<body>
  <script>
    localStorage.removeItem('currentUser');
    localStorage.removeItem('selectedEventId');
    localStorage.setItem('isAdminAuthenticated', 'false');
    window.location.replace('../pages/login.html');
  </script>
  <p>Logging out...</p>
  <p><a href="../pages/login.html">Go to login</a></p>
</body>
</html>
