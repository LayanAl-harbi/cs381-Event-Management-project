<?php
session_start();
require_once __DIR__ . "/../config/db.php";

function wants_json_response()
{
    return strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";
}

function finish_event_registration($success, $message, $redirect = "../pages/dashboard.html")
{
    if (wants_json_response()) {
        header("Content-Type: application/json");
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "redirect" => $redirect
        ]);
        exit();
    }

    if ($success) {
        header("Location: " . $redirect);
        exit();
    }

    echo htmlspecialchars($message, ENT_QUOTES, "UTF-8");
    exit();
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    finish_event_registration(false, "Invalid request.", "../pages/events.html");
}

$event_id = trim($_POST["event_id"] ?? "");
$student_id = trim($_POST["student_id"] ?? "");

if ($event_id === "") {
    finish_event_registration(false, "No event selected.", "../pages/events.html");
}

$user_id = $_SESSION["user_id"] ?? null;

if (!$user_id && $student_id !== "") {
    $user_lookup = $pdo->prepare("SELECT id, student_id, name, role FROM users WHERE student_id = ?");
    $user_lookup->execute([$student_id]);
    $user = $user_lookup->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        $user_id = $user["id"];
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["student_id"] = $user["student_id"];
        $_SESSION["user_name"] = $user["name"];
        $_SESSION["role"] = $user["role"];
    }
}

if (!$user_id) {
    finish_event_registration(false, "Please log in before registering for an event.", "../pages/login.html");
}

$check = $pdo->prepare("
    SELECT id FROM registrations
    WHERE user_id = ? AND event_id = ?
");
$check->execute([$user_id, $event_id]);

if ($check->rowCount() > 0) {
    finish_event_registration(false, "You are already registered for this event.");
}

$stmt = $pdo->prepare("
    INSERT INTO registrations (user_id, event_id, registration_date, status)
    VALUES (?, ?, NOW(), 'registered')
");
$stmt->execute([$user_id, $event_id]);

finish_event_registration(true, "Event registration saved.");
?>
