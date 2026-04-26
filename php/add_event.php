<?php
session_start();
require_once __DIR__ . "/../config/db.php";

function wants_json_response()
{
    return strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";
}

function finish_add_event($success, $message, $event_id = null)
{
    if (wants_json_response()) {
        header("Content-Type: application/json");
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "event_id" => $event_id
        ]);
        exit();
    }

    echo htmlspecialchars($message, ENT_QUOTES, "UTF-8");
    exit();
}

if (!isset($_SESSION["role"]) || $_SESSION["role"] !== "admin") {
    http_response_code(403);
    finish_add_event(false, "Access denied.");
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    finish_add_event(false, "Invalid request.");
}

$name = trim($_POST["name"] ?? "");
$date = $_POST["date"] ?? "";
$description = trim($_POST["description"] ?? "");

if ($name === "" || $date === "") {
    finish_add_event(false, "Please fill all required fields.");
}

$stmt = $pdo->prepare("
    INSERT INTO events (name, event_date, description)
    VALUES (?, ?, ?)
");
$stmt->execute([$name, $date, $description]);

finish_add_event(true, "Event added successfully.", $pdo->lastInsertId());
?>
