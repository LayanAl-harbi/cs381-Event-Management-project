<?php
session_start();

$employee_id = trim($_POST["employee_id"] ?? "");
$password = $_POST["password"] ?? "";
$is_ajax = strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";

if ($employee_id === "EMP001" && $password === "admin123") {
    $_SESSION["user_id"] = "admin";
    $_SESSION["student_id"] = $employee_id;
    $_SESSION["user_name"] = "Admin";
    $_SESSION["role"] = "admin";

    if ($is_ajax) {
        header("Content-Type: application/json");
        echo json_encode(["success" => true]);
        exit();
    }

    header("Location: ../pages/admin.html");
    exit();
}

if ($is_ajax) {
    http_response_code(401);
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "message" => "Invalid admin login."
    ]);
    exit();
}

echo "Invalid admin login.";
?>
