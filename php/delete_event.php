<?php
session_start();
include("../config/db.php");

$is_ajax = strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";

/* Allow only admin */
if (!isset($_SESSION['role']) || $_SESSION['role'] != 'admin') {
    if ($is_ajax) {
        http_response_code(403);
        header("Content-Type: application/json");
        echo json_encode([
            "success" => false,
            "message" => "Access denied."
        ]);
        exit();
    }

    echo "Access denied!";
    exit();
}

/* Check event id */
if (!isset($_GET['id'])) {
    if ($is_ajax) {
        http_response_code(400);
        header("Content-Type: application/json");
        echo json_encode([
            "success" => false,
            "message" => "No event selected."
        ]);
        exit();
    }

    echo "No event selected.";
    exit();
}

$event_id = $_GET['id'];

/* Optional: delete related registrations first */
$pdo->prepare("DELETE FROM registrations WHERE event_id = ?")
    ->execute([$event_id]);

/* Delete event */
$stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
$stmt->execute([$event_id]);

if ($is_ajax) {
    header("Content-Type: application/json");
    echo json_encode(["success" => true]);
    exit();
}

header("Location: ../pages/admin.html");
exit();
?>
