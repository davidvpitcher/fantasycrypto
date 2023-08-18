<?php


require_once '../../keys/storage.php';

$_POST = json_decode(file_get_contents('php://input'), true);

$coins = explode(',', $_POST['coins']);

$data = [];

try {
    $sql = 'SELECT * FROM (
        SELECT last_trade_price, request_time, pair_name 
        FROM crypto_prices 
        WHERE pair_name IN (' . str_repeat('?,', count($coins) - 1) . '?) 
        ORDER BY request_time DESC 
        LIMIT 288
    ) sub 
    ORDER BY request_time ASC';

    $stmt = $pdo->prepare($sql);
    

    foreach($coins as $index => $coin) {
        $stmt->bindValue($index+1, $coin, PDO::PARAM_STR);
    }

    $stmt->execute();
    $rawData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    

    foreach($rawData as $row) {
        $data[$row['pair_name']][] = $row;
    }
    header('Content-Type: application/json');

    echo json_encode($data);
    
} catch(PDOException $e) {
    echo 'Error: ' . $e->getMessage();
    exit();
}
?>
