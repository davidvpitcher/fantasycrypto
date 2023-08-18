<?php 

require_once '../keys/storage.php';
$transaction_fee_percent = 0.02;  

$coin_to_balance_map = array(
    "XXBTZUSD" => "bitcoin_balance",
    "XETHZUSD" => "ethereum_balance",
    "XLTCZUSD" => "litecoin_balance",
    "XDGUSD" => "dogecoin_balance",
    "DOTUSD" => "polkadot_balance",
    "ADAUSD" => "cardano_balance"
);
$coin_to_name_map = array(
    "XXBTZUSD" => "BTC",
    "XETHZUSD" => "ETH",
    "XLTCZUSD" => "LTC",
    "XDGUSD" => "XDG",
    "ADAUSD" => "ADA",
    "DOTUSD" => "DOT"
);

$pair_to_coin_map = array(
    "BTC" => "XXBTZUSD",
    "ETH" => "XETHZUSD",
    "LTC" => "XLTCZUSD",
    "Doge" => "XDGUSD",
    "DOT" => "DOTUSD",
    "ADA" => "ADAUSD"
);
$data = json_decode(file_get_contents('php://input'), true);



if (isset($data["quantity"])) {

    $quantity = $data['quantity'];
    $coin1 = $data['coin'];
    $userID = $data['userID'];
    
$coin = $pair_to_coin_map[$coin1];
   
    $stmt = mysqli_prepare($conn, "SELECT last_trade_price FROM crypto_prices WHERE pair_name = ? ORDER BY request_time DESC LIMIT 1");

    if ($stmt) {
        mysqli_stmt_bind_param($stmt, "s", $coin);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        $price = $row["last_trade_price"];
        
        $value = $quantity * $price;

        $stmt = mysqli_prepare($conn, "SELECT usd_balance, {$coin_to_balance_map[$coin]} FROM user_assets WHERE user_id = ?");
        if ($stmt) {
            mysqli_stmt_bind_param($stmt, "i", $userID);
            mysqli_stmt_execute($stmt);
            $result = mysqli_stmt_get_result($stmt);
            $row = mysqli_fetch_assoc($result);
            $usd_balance = $row["usd_balance"];
            $coin_balance = $row[$coin_to_balance_map[$coin]];

            $fee = $transaction_fee_percent * $value;

            
if ($fee < 0.01) {
    $fee = 0.01;
}


            $new_total_value = $value - $fee;

        

            if ($coin_balance >= $quantity && $value >= 0.01) {
                $stmt = mysqli_prepare($conn, "UPDATE user_assets SET usd_balance = usd_balance + ?, {$coin_to_balance_map[$coin]} = {$coin_to_balance_map[$coin]} - ? WHERE user_id = ?");
                if ($stmt) {
                    mysqli_stmt_bind_param($stmt, "ddi", $new_total_value, $quantity, $userID);
                    mysqli_stmt_execute($stmt);

                    $affectedRows = mysqli_stmt_affected_rows($stmt);
                    if ($affectedRows > 0) {
                        $stmt = mysqli_prepare($conn, "SELECT usd_balance, {$coin_to_balance_map[$coin]} FROM user_assets WHERE user_id = ?");
                        if ($stmt) {
                            mysqli_stmt_bind_param($stmt, "i", $userID);
                            mysqli_stmt_execute($stmt);
                            $result = mysqli_stmt_get_result($stmt);
                          
                            $row = mysqli_fetch_assoc($result);
                            $new_usd_balance = $row["usd_balance"];
                            $new_coin_balance = $row[$coin_to_balance_map[$coin]];

                  
                         
                            $stmt = mysqli_prepare($conn, "INSERT INTO user_transactions (user_id, transaction_type, coin, coin_price_at_transaction, quantity, amount_in_usd, fees_in_usd, post_transaction_usd_balance, post_transaction_coin_balance, transaction_time) VALUES (?, 'sell', ?, ?, ?, ?, ?, ?, ?, NOW())");
                      
                        
                      
                            if ($stmt) {


                           

                          mysqli_stmt_bind_param($stmt, "isdddddd", $userID, $coin, $price, $quantity, $new_total_value, $fee, $new_usd_balance, $new_coin_balance);


               
      mysqli_stmt_execute($stmt);



                                $transactionAffectedRows = mysqli_stmt_affected_rows($stmt);

                       
                                if ($transactionAffectedRows > 0) {
                                    echo json_encode([
                                        'status' => 'success', 
                                        'message' => 'Transaction completed successfully!', 
                                        'usd_balance' => $new_usd_balance, 
                                        'coin_balance' => $new_coin_balance,
                                        'coin' => $coin,
                                        'fee' => $fee,
                                        'total_value' => $new_total_value 
                                    ]);
                                  
                                    exit();
                                } else {
                                    echo json_encode(['status' => 'error', 'message' => 'Failed to record the transaction.']);
                                    exit();
                                }
                            } else {
                                echo json_encode(['status' => 'error', 'message' => 'Failed to prepare the SQL statement.']);
                                exit();
                            }
                        } else {
                            echo json_encode(['status' => 'error', 'message' => 'Failed to retrieve updated balances after the transaction.']);
                            exit();
                        }
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Failed to update balances.']);
                        exit();
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Failed to prepare the SQL statement.']);
                    exit();
                }
            } else if ($value < 0.01) {
                $min_quantity = 0.01 / $price;
                $min_quantity_formatted = number_format($min_quantity, 10); 
                $coin_name = $coin_to_name_map[$coin];
                echo json_encode(['status' => 'error', 'message' => "The minimum transaction value is $0.01. You need to sell at least $min_quantity_formatted $coin_name"]);
                exit();
            } else {
                echo json_encode(['status' => 'error', 'message' => 'Not enough coin quantity for this transaction.']);
                exit();
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to retrieve balance information.']);
            exit();
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to retrieve latest coin price.']);
        exit();
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'User is not authenticated.']);
    exit();
}
?>
