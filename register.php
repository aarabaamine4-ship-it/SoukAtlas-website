<?php
session_start();
require_once 'includes/db.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($name !== '' && $email !== '' && $password !== '') {
        try {
            $stmt = $pdo->prepare('INSERT INTO merchants (name, email, password) VALUES (?, ?, ?)');
            $stmt->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
            $success = 'Account created successfully. You can now log in.';
        } catch (PDOException $e) {
            $error = $e->getCode() === '23000'
                ? 'This email is already registered.'
                : 'Something went wrong. Please try again.';
        }
    } else {
        $error = 'Please fill in all fields.';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Register | Souk Atlas</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/auth.css" />
  </head>
  <body class="auth-page">
    <main class="auth-card">
      <a class="auth-logo" href="index.html"><span>SA</span> Souk Atlas</a>
      <p class="auth-kicker">Join the Marketplace</p>
      <h1>Create seller account</h1>
      <p class="auth-subtitle">Start posting meat listings and appear on the Souk Atlas map.</p>

      <?php if ($error): ?>
        <div class="auth-alert"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <?php if ($success): ?>
        <div class="auth-alert success"><?php echo htmlspecialchars($success); ?></div>
      <?php endif; ?>

      <form method="POST" action="register.php" class="auth-form">
        <label>
          <span>Full name</span>
          <input type="text" name="name" placeholder="Boucherie Atlas" required />
        </label>
        <label>
          <span>Email</span>
          <input type="email" name="email" placeholder="seller@soukatlas.ma" required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" name="password" placeholder="Create a password" required />
        </label>
        <button class="auth-button" type="submit">Create Account</button>
      </form>

      <div class="auth-links">
        <p>Already have an account? <a href="login.php">Login</a></p>
      </div>
    </main>
  </body>
</html>
