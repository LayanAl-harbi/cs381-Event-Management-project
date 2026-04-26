<?php
session_start();
require_once __DIR__ . "/../config/db.php";

function wants_json_response()
{
    return strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";
}

function finish_add_user($success, $message)
{
    if (wants_json_response()) {
        header("Content-Type: application/json");
        echo json_encode([
            "success" => $success,
            "message" => $message
        ]);
        exit();
    }

    echo htmlspecialchars($message, ENT_QUOTES, "UTF-8");
    exit();
}

if (!isset($_SESSION["role"]) || $_SESSION["role"] !== "admin") {
    http_response_code(403);
    finish_add_user(false, "Access denied.");
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    finish_add_user(false, "Invalid request.");
}

$student_id = trim($_POST["student_id"] ?? "");
$name = trim($_POST["name"] ?? "");
$password = $_POST["password"] ?? "";
$role = $_POST["role"] ?? "user";

if ($student_id === "" || $name === "" || $password === "") {
    finish_add_user(false, "Please fill all fields.");
}

$check = $pdo->prepare("SELECT id FROM users WHERE student_id = ?");
$check->execute([$student_id]);

if ($check->rowCount() > 0) {
    finish_add_user(false, "User already exists.");
}

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("
    INSERT INTO users (student_id, name, password, role)
    VALUES (?, ?, ?, ?)
");
$stmt->execute([$student_id, $name, $hashed_password, $role]);

finish_add_user(true, "User added successfully.");
?>
