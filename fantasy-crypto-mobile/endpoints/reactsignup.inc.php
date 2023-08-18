<?php 


    header("Access-Control-Allow-Origin: *");

header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST"); 
header("Access-Control-Max-Age: 3600"); 
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


header('Cache-Control: no-store, private, no-cache, must-revalidate'); 
header('Cache-Control: pre-check=0, post-check=0, max-age=0, max-stale = 0', false);
header('Pragma: public');
header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
header('Expires: 0', false);
header('Last-Modified: '.gmdate('D, d M Y H:i:s') . ' GMT');
header ('Pragma: no-cache');

if (isset($_POST["uid"])) {

    $username = $_POST["uid"];
    $pwd = $_POST["pwd"];
    $pwdRepeat = $_POST["pwdrepeat"];

    require_once '../../keys/storage.php';
    
    require_once 'functions.inc.php';
    // Error handlers
    // Check for empty fields
    if (emptyInputSignup($username, $pwd, $pwdRepeat) !== false) {
        echo json_encode(['error' => 'Empty input']);
        exit();
    }
    // Check for invalid username
    if (invalidUid($username) !== false) {
        echo json_encode(['error' => 'Invalid username']);
        exit();
    }
    // Check if passwords match
    if (pwdMatch($pwd, $pwdRepeat) !== false) {
        echo json_encode(['error' => 'Passwords do not match']);
        exit();
    }
    // Check if username is already taken
    if (uidExists($conn, $username, $username) !== false) {
        echo json_encode(['error' => 'Username is already taken']);
        exit();
    }
 
    // Create the user
    createUserShop($conn, $username, $pwd, $pdo);

    echo json_encode(['success' => 'User created']);
    exit();
} else {
    echo json_encode(['error' => 'No POST data']);
    exit();
}
function createUserShop($conn, $username, $pwd, $pdo) {


    $sql = 'INSERT INTO users (usersUid, usersPwd) VALUES (?,?)';
     $stmt = mysqli_stmt_init($conn);
     
     if (!mysqli_stmt_prepare($stmt, $sql)) {
        echo json_encode(['error' => 'fail insert']);
        die();
     }
     
 $hashedPwd = password_hash($pwd, PASSWORD_DEFAULT);
 
     mysqli_stmt_bind_param($stmt, "ss", $username, $hashedPwd);
 
 
     mysqli_stmt_execute($stmt);
     mysqli_stmt_close($stmt);
 
 
   
 
                     }
 