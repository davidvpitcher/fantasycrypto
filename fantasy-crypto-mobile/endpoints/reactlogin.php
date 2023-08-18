<?php 

$requestOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

if(empty($requestOrigin) && isset($_SERVER['HTTP_REFERER'])) {
    $requestOrigin = parse_url($_SERVER['HTTP_REFERER'], PHP_URL_SCHEME).'://'.parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST);
}

$allowedOrigins = [
    'https://mortalitycore.com',
    'https://www.mortalitycore.com',
];

if (empty($requestOrigin) || in_array($requestOrigin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $requestOrigin");
} else {
    header('HTTP/1.1 403 Forbidden');
    exit();
}

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


require_once '../../../keys/storage.php';

require_once '../../vendor/autoload.php';

use \Firebase\JWT\JWT;

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $json = file_get_contents('php://input');
    
  
    $data = json_decode($json, true);
    $username = $data["username"];
    $pwd = $data["password"];

    if (empty($username) || empty($pwd)) {
        $response = [
            "status" => "error",
            "message" => "Both username and password are required"
        ];
        echo json_encode($response);
        exit();
    }

    loginUsers($conn, $username, $pwd, $pdo, $specialphrase);
}

function uidExists($conn, $username, $email) {
                
    $sql = 'SELECT * FROM users WHERE usersUid = ? OR usersUid = ?;';
$stmt = mysqli_stmt_init($conn);

if (!mysqli_stmt_prepare($stmt, $sql)) {

exit();

}

mysqli_stmt_bind_param($stmt, "ss", $username, $email);
mysqli_stmt_execute($stmt);

$resultData = mysqli_stmt_get_result($stmt);

if ($row = mysqli_fetch_assoc($resultData)) {
return $row;


} else {
$result = false;
return $result;
}

mysqli_stmt_close($stmt);


    }
    function loginUsers($conn, $username, $pwd, $pdo, $specialphrase) {
        $uidExists = uidExists($conn, $username, $username);
        $response = [];
    
        if ($uidExists === false) {
            $response["status"] = "error";
            $response["message"] = "Invalid username";
            echo json_encode($response);
            exit();
        }
    
        $pwdHashed = $uidExists["usersPwd"];
        $checkPwd = password_verify($pwd, $pwdHashed);
    
        if ($checkPwd === false) {
            $response["status"] = "error";
            $response["message"] = "Invalid password";
            echo json_encode($response);
            exit();
        } else if ($checkPwd === true) {
            $currentusername = $uidExists["usersUid"];
            $sql = 'SELECT `username`,`is_admin` FROM `users_permissions` WHERE `username`="' . $currentusername. '"';
            $result = $pdo->query($sql);
    
            $hadpermissions = "NORMAL";
            $one = "1";
            $role = "user";
            foreach ($result as $row) {
                $stuff = $row['username'];
                $stuff2 = $row['is_admin'];
                if ($stuff === $currentusername && $stuff2 == $one) {
                    $hadpermissions = "SPECIAL";
                }
                if ($stuff === $currentusername && $stuff2 == $one && $currentusername === "admin") {
                    $role = "admin";
                } else {
                    $role = "user";
                }
                
            }
    
           
            $jwtPayload = array(
                "iss" => "mortalitycore.com", 
                "sub" => $uidExists["usersId"], 
                "username" => $currentusername,
                "permissions" => $hadpermissions,
                "role" => $role,
                "exp" => time() + (60 * 60 * 24), 
            );
            $jwtSecretKey = $specialphrase;
            $jwt = JWT::encode($jwtPayload, $jwtSecretKey);
    
            

setcookie('jwt', $jwt, [
    'expires' => time() + (60 * 60 * 24), 
    'path' => '/',
    'secure' => true, 
    'httponly' => true, 
    'samesite' => 'Strict',
]);

    
$response["status"] = "success";
$response["jwt"] = $jwt;
$response["userId"] = $uidExists["usersId"]; 
echo json_encode($response);
exit();

        }
}
?>
