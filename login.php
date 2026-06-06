<?php
session_start();
require_once 'includes/db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if ($email !== '' && $password !== '') {
        $stmt = $pdo->prepare('SELECT * FROM merchants WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['merchant_id'] = $user['id'];
            $_SESSION['merchant_name'] = $user['name'];
            header('Location: index.html');
            exit;
        }

        $error = 'Email or password is incorrect.';
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
    <title>Login | Souk Atlas</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="css/auth.css" />
  </head>
  <body class="auth-page">
    <main class="auth-card">
      <a class="auth-logo" href="index.html"><span>SA</span> Souk Atlas</a>
      <p class="auth-kicker">Merchant Workspace</p>
      <h1>Welcome back</h1>
      <p class="auth-subtitle">Log in to manage your meat listings and seller profile.</p>

      <?php if ($error): ?>
        <div class="auth-alert"><?php echo htmlspecialchars($error); ?></div>
      <?php endif; ?>

      <div class="social-grid">
        <button type="button">Continue with Google</button>
        <button type="button">Continue with Apple</button>
      </div>

      <div class="auth-divider"><span>or</span></div>

      <form method="POST" action="login.php" class="auth-form">
        <label>
          <span>Email</span>
          <input type="email" name="email" placeholder="seller@soukatlas.ma" required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" name="password" placeholder="Your password" required />
        </label>
        <button class="auth-button" type="submit">Login</button>
      </form>

      <div class="auth-links">
        <a href="#">Forgot password?</a>
        <p>No account yet? <a href="register.php">Create one</a></p>
      </div>
    </main>
  </body>
</html>
