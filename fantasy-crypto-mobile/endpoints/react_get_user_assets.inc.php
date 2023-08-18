<?php 

require_once '../../keys/storage.php';

$postData = json_decode(file_get_contents('php://input'), true);

$user_id = $postData['userId']; 

try {
 
    $sql = 'SELECT * FROM user_assets WHERE user_id = :user_id';
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $userAssets = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($userAssets === false) {
        echo json_encode(['error' => 'No data to fetch']);
    } else {
        echo json_encode($userAssets);
    }
} catch(PDOException $e) {
    echo json_encode(['error' => 'errrr']);
}