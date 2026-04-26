<?php
session_start();
require_once __DIR__ . "/../config/db.php";

function wants_json_response()
{
    return strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";
}

function finish_login($success, $message, $redirect = "../pages/login.html", $user = null)
{
    if (wants_json_response()) {
        header("Content-Type: application/json");
        echo json_encode([
            "success" => $success,
            "message" => $message,
            "redirect" => $redirect,
            "user" => $user
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
    finish_login(false, "Invalid request.");
}

$student_id = trim($_POST["student_id"] ?? "");
$password = $_POST["password"] ?? "";

if ($student_id === "" || $password === "") {
    finish_login(false, "Please enter your student ID and password.");
}

$stmt = $pdo->prepare("SELECT * FROM users WHERE student_id = ?");
$stmt->execute([$student_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify($password, $user["password"])) {
    finish_login(false, "Invalid login credentials.");
}

$_SESSION["user_id"] = $user["id"];
$_SESSION["student_id"] = $user["student_id"];
$_SESSION["user_name"] = $user["name"];
$_SESSION["role"] = $user["role"];

$redirect = $user["role"] === "admin" ? "../pages/admin.html" : "../pages/dashboard.html";

finish_login(true, "Login successful.", $redirect, [
    "id" => $user["id"],
    "student_id" => $user["student_id"],
    "name" => $user["name"],
    "email" => $user["email"] ?? "",
    "major" => $user["major"] ?? "",
    "date_of_birth" => $user["date_of_birth"] ?? "",
    "role" => $user["role"]
]);
?>
