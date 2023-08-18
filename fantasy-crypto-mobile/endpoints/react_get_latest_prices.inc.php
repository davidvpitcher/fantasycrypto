<?php 

require_once '../../keys/storage.php';

$coinNames = [
  'XXBTZUSD' => 'BTC',
  'XETHZUSD' => 'ETH',
  'XLTCZUSD' => 'LTC',
  'XDGUSD' => 'Doge',
  'ADAUSD' => 'ADA',
  'DOTUSD' => 'DOT'
];

$result = [];

foreach ($coinNames as $pairName => $coin) {
    $sql = 'SELECT * FROM crypto_prices WHERE pair_name = :pair_name ORDER BY id DESC LIMIT 1';
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':pair_name', $pairName, PDO::PARAM_STR);
    $stmt->execute();
    $latestPrice = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($latestPrice !== false) {
        $result[$coin] = number_format($latestPrice['last_trade_price'], 2, '.', '');
    }
}

echo json_encode($result);
