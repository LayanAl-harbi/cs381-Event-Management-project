<?php
session_start();
require_once __DIR__ . "/../config/db.php";

function wants_json_response()
{
    return strtolower($_SERVER["HTTP_X_REQUESTED_WITH"] ?? "") === "xmlhttprequest";
}

function finish_registration($success, $message, $redirect = "../pages/dashboard.html")
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
    finish_registration(false, "Invalid request.", "../pages/register.html");
}

$student_id = trim($_POST["student_id"] ?? "");
$name = trim($_POST["name"] ?? "");
$password = $_POST["password"] ?? "";
$event_id = trim($_POST["event_id"] ?? "");

if ($student_id === "" || $name === "" || $password === "") {
    finish_registration(false, "Please fill in all required fields.", "../pages/register.html");
}

try {
    $pdo->beginTransaction();

    $check = $pdo->prepare("SELECT id, student_id, name, password, role FROM users WHERE student_id = ?");
    $check->execute([$student_id]);
    $user = $check->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        if (!password_verify($password, $user["password"])) {
            $pdo->rollBack();
            finish_registration(false, "Student ID already registered.", "../pages/register.html");
        }

        $user_id = $user["id"];
        $session_name = $user["name"];
        $role = $user["role"];
    } else {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $pdo->prepare("
            INSERT INTO users (student_id, name, password, role)
            VALUES (?, ?, ?, 'user')
        ");
        $stmt->execute([$student_id, $name, $hashed_password]);

        $user_id = $pdo->lastInsertId();
        $session_name = $name;
        $role = "user";
    }

    $_SESSION["user_id"] = $user_id;
    $_SESSION["student_id"] = $student_id;
    $_SESSION["user_name"] = $session_name;
    $_SESSION["role"] = $role;

    if ($event_id !== "") {
        $registration_check = $pdo->prepare("
            SELECT id FROM registrations
            WHERE user_id = ? AND event_id = ?
        ");
        $registration_check->execute([$user_id, $event_id]);

        if ($registration_check->rowCount() === 0) {
            $registration = $pdo->prepare("
                INSERT INTO registrations (user_id, event_id, registration_date, status)
                VALUES (?, ?, NOW(), 'registered')
            ");
            $registration->execute([$user_id, $event_id]);
        }
    }

    $pdo->commit();

    $message = $event_id !== ""
        ? "Account created and event registration saved."
        : "Account created successfully.";

    finish_registration(true, $message);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    finish_registration(false, "Could not save registration. Please check your database connection.", "../pages/register.html");
}
?>
