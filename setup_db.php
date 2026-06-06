<?php
$host = 'localhost';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("CREATE DATABASE IF NOT EXISTS souqmap CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE souqmap");

    $pdo->exec(
        "CREATE TABLE IF NOT EXISTS merchants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            business_name VARCHAR(150),
            phone VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )"
    );

    echo "<!DOCTYPE html><html><head><meta charset='UTF-8'><title>Souk Atlas Setup</title><link rel='stylesheet' href='css/auth.css'></head><body class='auth-page'>";
    echo "<main class='auth-card setup-card'><h1>Souk Atlas database is ready</h1><p>Database <strong>souqmap</strong> and table <strong>merchants</strong> are available.</p><a class='auth-button' href='register.php'>Create an account</a></main>";
    echo "</body></html>";
} catch (PDOException $e) {
    die("Setup error: " . $e->getMessage());
}
?>
