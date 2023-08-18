import React, { useState, useEffect } from 'react';

import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, Button, TextInput, Alert } from 'react-native'; 
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';


import { useIsFocused } from '@react-navigation/native';
const darkBlue = "rgba(0,0,139,1)";
const ghostGreen = "rgba(173,216,230,1)";


const data = {
  labels: ["January", "February", "March", "April", "May", "June"],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      color: (opacity = 1) => `rgba(173,216,230, ${opacity})`, 
      strokeWidth: 2 
    }
  ],
  legend: ["LOADING DATA"] 
};
const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientFromOpacity: 1,
  propsForLabels: {
    fontSize: 9.5, 
  },
  backgroundGradientTo: "#000000",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(0,0,139, ${opacity})`,
strokeWidth: 2,
  barPercentage: 0.5,
  yAxisLabel: '',
  decimalPlaces: 4,
  labelColor: (opacity = 1) => `rgba(0,0,139, ${opacity})`,
};

const screenWidth = Dimensions.get("window").width;
  


const NavBar = ({ setModalVisible, balances, prices, userId, refreshBalances }) => {
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [modalVisible, setLocalModalVisible] = useState(false);
  const [coinModalVisible, setCoinModalVisible] = useState(false);
  const [coin, setCoin] = useState('BTC');
  const [amount, setAmount] = useState(50);
  const [estimatedFeeAndQuantity, setEstimatedFeeAndQuantity] = useState({ fee: 0, quantity: 0 });
  const [sellAmount, setSellAmount] = useState(0.00001);
  const [sellCoin, setSellCoin] = useState('BTC');
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [sellCoinModalVisible, setSellCoinModalVisible] = useState(false)
  const [estimatedSellFeeAndRevenue, setEstimatedSellFeeAndRevenue] = useState({ fee: 0, revenue: 0 });
  const [chartData, setChartData] = useState(data || { labels: [], datasets: [] }); 
  const [chartCoin, setChartCoin] = useState('ADAUSD'); 
  const [chartModalVisible, setChartModalVisible] = useState(false);
  const [leaderboardModalVisible, setLeaderboardModalVisible] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const isFocused = useIsFocused();
  const [rawData, setRawData] = useState(null);
  const [selectedCoin, setSelectedCoin] = useState('ADAUSD');


  const formatDataForChart = (data, coin) => {

    const formattedData = { labels: [], datasets: [], showLabel: [] };
    if (!data) {
      console.error('Data is undefined');
      return { labels: [], datasets: [], showLabel: [] };
    } 
    if (!data[coin]) {
     
      return formattedData;
    }
  
    const timestamps = data[coin].map(item => item.request_time);
  

  formattedData.labels = timestamps.map((timestamp, index) => 
  index === 0 || index === Math.floor(timestamps.length / 2) || index === timestamps.length - 1 ? timestamp : ''
);

      
    formattedData.showLabel = timestamps.map((_, index) => 
      index === 0 || index === Math.floor(timestamps.length / 2) || index === timestamps.length - 1
    );
  
    const dataset = {
      label: coin,
      data: data[coin].map(item => parseFloat(item.last_trade_price)),
      color: (opacity = 1) => `rgba(173, 216, 255, ${opacity})`,
      strokeWidth: 2,
    
    };
  
    formattedData.datasets.push(dataset);
  
    return formattedData;
  };
  
  
  const handleChartPress = () => {
    setChartModalVisible(true);
  }

  
  const handleHistoryPress = () => {
    setHistoryModalVisible(true);
  }

  
  const handleLeaderboardPress = () => {
    setLeaderboardModalVisible(true);
  }

  const handleSellPress = () => {
    setSellModalVisible(true);
  }

  const handleActualSell = () => {
    const data = {
        quantity: sellAmount,
        coin: sellCoin,
        userID: userId,
    };

    axios.post('https://www.mortalitycore.com/reactsell.php', data)
        .then((response) => {
            if (response.data.status === 'success') {
                Alert.alert('Transaction successful!');
               refreshBalances();
            
                setSellModalVisible(false);
            } else {
                Alert.alert('Transaction failed!', response.data.message);
            }
        })
        .catch((error) => {
            Alert.alert('Transaction failed!');
            console.error(error);
        });
};

  const calculateEstimatedSellFeeAndRevenue = (coin, amount) => {
    if (coin && amount) {
      const parsedAmount = parseFloat(amount);
   
      if (!isNaN(parsedAmount)) {
        const estimatedFee = parsedAmount * 0.02; 
        const estimatedRevenue = (parsedAmount - estimatedFee) * prices[coin];
        setEstimatedSellFeeAndRevenue({
          fee: estimatedFee,
          revenue: estimatedRevenue
        });
      }
    }
  }
  

const coinToBalanceProp = coinSymbol => {
  switch (coinSymbol) {
    case 'BTC':
      return 'bitcoin_balance';
    case 'ETH':
      return 'ethereum_balance';
    case 'LTC':
      return 'litecoin_balance';
    case 'Doge':
      return 'dogecoin_balance';
    case 'ADA':
      return 'cardano_balance';
    case 'DOT':
      return 'polkadot_balance';
    default:
      throw new Error('Unknown coin symbol');
  }
}
const handleSellAmountChange = text => {
  setSellAmount(text);
  calculateEstimatedSellFeeAndRevenue(sellCoin, text);
};

const handleSellCoinSelection = coinName => {
  setSellCoin(coinName);
  setSellCoinModalVisible(false);
  calculateEstimatedSellFeeAndRevenue(coinName, sellAmount);
}

  const BTCPrice = prices.BTC;
  const ETHPrice = prices.ETH;
  const LTCPrice = prices.LTC;
  const XDGPrice = prices.XDG;
  const ADAPrice = prices.ADA;
  const DOTPrice = prices.DOT;
  const [isPressed, setIsPressed] = useState(false);
  const coins = {
    'BTC': require('../assets/images/Bitcoin.png'),
    'ETH': require('../assets/images/Ethereum.png'),
    'LTC': require('../assets/images/Litecoin.png'),
    'Doge': require('../assets/images/Dogecoin.png'),
    'ADA': require('../assets/images/Cardano.png'),
    'DOT': require('../assets/images/Polkadot.png')
  };

  const coinPairs = {
    'XXBTZUSD': require('../assets/images/Bitcoin.png'),
    'XETHZUSD': require('../assets/images/Ethereum.png'),
    'XLTCZUSD': require('../assets/images/Litecoin.png'),
    'XDGUSD': require('../assets/images/Dogecoin.png'),
    'ADAUSD': require('../assets/images/Cardano.png'),
    'DOTUSD': require('../assets/images/Polkadot.png')
  };

  useEffect(() => {
    if (isFocused && chartModalVisible) {
      axios.post('https://www.mortalitycore.com/includes/reactfetchdata.php', {
        coins: 'XXBTZUSD,XETHZUSD,XLTCZUSD,XDGUSD,ADAUSD,DOTUSD',
      })      
        .then((response) => {
          let responseJSONString = response.request._response;
          let jsonStart = responseJSONString.indexOf('{');
          responseJSONString = responseJSONString.substring(jsonStart);
          let responseData = JSON.parse(responseJSONString);
     

          setRawData(responseData); 

          const formattedData = formatDataForChart(responseData, 'ADAUSD');
          setChartData(formattedData);

        })
        .catch((error) => {
          console.error('Error fetching chart data', error);
        });
    }
    if (coin && amount) {
      const parsedAmount = parseFloat(amount);
  
      if (!isNaN(parsedAmount)) {
        const estimatedFee = parsedAmount * 0.02; 
        const estimatedQuantity = (parsedAmount - estimatedFee) / prices[coin];
        if (estimatedFee < 0.05) {
          estimatedFee = 0.05;
        }
        setEstimatedFeeAndQuantity({
          fee: estimatedFee,
          quantity: estimatedQuantity
        });
      }
    }
  }, [coin, amount, isFocused, chartModalVisible]);
  
  const handleBuyPress = () => {
    setLocalModalVisible(true);
    setModalVisible(true);
  }

  const handleActualPurchase = () => {

    const data = {
      quantity: estimatedFeeAndQuantity.quantity,
      coin: coin,
      userID: userId,
    };
     

    axios.post('https://www.mortalitycore.com/reactbuy.php', data)
      .then((response) => {
   
        Alert.alert('Transaction successful!');

        setLocalModalVisible(false);
        setModalVisible(false);

    
        refreshBalances(); 
      })
      .catch((error) => {
    
        Alert.alert('Transaction failed!');
        console.error(error);
      });
  };

const handleSellCoinModalOpen = () => {
  setSellCoinModalVisible(true);
}

const handleAmountChange = text => {
  const sanitizedText = text.replace(/[\s,]+/g,'');
  const number = parseFloat(sanitizedText);

  if (sanitizedText === '' || sanitizedText === null || sanitizedText === undefined) {
    setAmount('');
  } else if (!isNaN(number) && number <= balances.usd_balance) {
    setAmount(sanitizedText);
    calculateEstimatedFeeAndQuantity(coin, number); 
  } else {
    Alert.alert('Invalid amount!');
  }
};

const handleCoinSelection = coinName => {
  setCoin(coinName);
  setCoinModalVisible(false);
  calculateEstimatedFeeAndQuantity(coinName, amount); 
}
const calculateEstimatedFeeAndQuantity = (coin, amount) => {
  if (coin && amount) {
    const parsedAmount = parseFloat(amount);

    if (!isNaN(parsedAmount)) {
      const estimatedFee = parsedAmount * 0.02;
      if (estimatedFee < 0.05) {
        estimatedFee = 0.05;
      }
      const estimatedQuantity = (parsedAmount - estimatedFee) / prices[coin];

      setEstimatedFeeAndQuantity({
        fee: estimatedFee,
        quantity: estimatedQuantity
      });
    }
  }
}

  return (
    <View style={styles.container}>
      
      <Modal
  animationType="slide"
  transparent={false}
  visible={historyModalVisible}
  onRequestClose={() => {
    Alert.alert('Modal has been closed.');
  }}
>
  <View style={{ marginTop: 22 }}>
    <View>
      <Text style={{ marginLeft: 10 }}>History:</Text>
      <Button title="Close" onPress={() => {
        setHistoryModalVisible(false);
      }}/>
    </View>
  </View>
</Modal>
      <Modal
  animationType="slide"
  transparent={false}
  visible={leaderboardModalVisible}
  onRequestClose={() => {
    Alert.alert('Modal has been closed.');
  }}
>
  <View style={{ marginTop: 22 }}>
    <View>
      <Text style={{ marginLeft: 10 }}>Charts:</Text>
      <Button title="Close" onPress={() => {
        setLeaderboardModalVisible(false);
      }}/>
    </View>
  </View>
</Modal>





<Modal
  animationType="slide"
  transparent={false}
  visible={chartModalVisible}
  onRequestClose={() => {
    Alert.alert('Modal has been closed.');
  }}
>

      <Text style={{ marginLeft: 10 }}>Charts:</Text>
      <View style={{ width: screenWidth + 50, overflow: 'visible' }}>
      <LineChart
      data={chartData}
      width={screenWidth}
      height={345}
      chartConfig={chartConfig}
      bezier
      onDataPointClick={({ value, dataset, getColor }) =>
        setSelectedDataPoint({ value, dataset, color: getColor() })
      }
    />

    {selectedDataPoint && (
      <View>
        <Text style={{ marginLeft: 10 }}>Selected data point:</Text>
        <Text style={{ marginLeft: 10 }}>Value: {selectedDataPoint.value}</Text>
      </View>
    )}
</View>
  <View style={{ marginTop: 22 }}>

  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10, marginRight: 10 }}>
  {Object.keys(coinPairs).map((coinKey) => (
 <TouchableOpacity 
 key={coinKey} 
 style={[
   styles.botton,
   selectedCoin === coinKey ? styles.bottonSelected : null
 ]} 
 onPress={() => {
   setChartCoin(coinKey);
   setSelectedCoin(coinKey);
   if (rawData && rawData[coinKey]) {
     setChartData(formatDataForChart(rawData, coinKey));
   } else {
     console.error(coinKey);
     console.error('rawData for the selected coinKey is undefined');
   }
 }}
>
 <Image source={coinPairs[coinKey]} style={styles.bottonImage} />
 <Text style={
   selectedCoin === coinKey 
     ? styles.bottonTextSelected 
     : styles.bottonText
 }>
   {coinKey}
 </Text>
</TouchableOpacity>
  ))}

</View>

    <View  style={{ marginTop: 42 }}>
 

      <Button title="Close" onPress={() => {
        setChartModalVisible(false);
      }}/>
    </View>
  </View>
</Modal>

       <Modal
  animationType="slide"
  transparent={false}
  visible={sellModalVisible}
  onRequestClose={() => {
    Alert.alert('Modal has been closed.');
  }}
>
  <View style={{ marginTop: 22 }}>
    <View>
      <Text style={{ marginLeft: 10 }}>Sell your coins:</Text>
      <Text style={{ marginLeft: 10, color: '#2ecc71' }}>
  {balances && sellCoin ? `Your ${sellCoin} balance: ${balances[coinToBalanceProp(sellCoin)]}` : 'Select a coin to see your balance'}
</Text>

      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={handleSellCoinModalOpen}
      >
        <Text style={isPressed ? styles.pressedDropdownText : styles.dropdownText}>
          Choose Coin: {sellCoin ? sellCoin : '[ choose coin type ]'}
        </Text>
      </TouchableOpacity>

      {/* Coin Selection Modal for Selling */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sellCoinModalVisible}
        onRequestClose={() => setSellCoinModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
          {Object.entries(coins).map(([coinName, coinImage], index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => handleSellCoinSelection(coinName)}
                style={styles.coinSelectionItem}
              >
                <Image source={coinImage} style={styles.coinImage} />
                <Text style={styles.coinName}>{coinName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Text  style={{ marginLeft: 10 }}>Amount to Instantly Sell</Text>
      <TextInput 
        value={String(sellAmount)}
        keyboardType='numeric'
        onChangeText={handleSellAmountChange}
      />
     <Button
  title="Instant Sell"
  color="#001F3F"
  onPress={handleActualSell}
/>
<Button
  title="Max"
  onPress={() => setSellAmount(balances[coinToBalanceProp(sellCoin)])}
/>
<Text style={{marginLeft: 10}}>Estimated Fee: ${estimatedSellFeeAndRevenue.fee.toFixed(2)}</Text>
<Text style={{marginLeft: 10}}>Estimated USD After Sale: ${estimatedSellFeeAndRevenue.revenue.toFixed(2)}</Text>

      <Button title="Close" onPress={() => {
        setSellModalVisible(false);
      }}/>
    </View>
  </View>
</Modal>
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
      }}>
      <View style={{ marginTop: 22 }}>
        <View>
          <Text  style={{marginLeft: 10}}>Instant Purchase with USD:</Text>
          <Text style={{marginLeft: 10, color: '#2ecc71'}}>Current Balance: ${balances.usd_balance}</Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setCoinModalVisible(true)}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
          >
            <Text style={isPressed ? styles.pressedDropdownText : styles.dropdownText}>
              Choose Coin: {coin ? coin : '[ choose coin type ]'}
            </Text>
          </TouchableOpacity>

            {/* Coin Selection Modal */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={coinModalVisible}
              onRequestClose={() => setCoinModalVisible(false)}
            >
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                {Object.entries(coins).map(([coinName, coinImage], index) => (
                    <TouchableOpacity 
                      key={index} 
                      onPress={() => handleCoinSelection(coinName)}
                      style={styles.coinSelectionItem}
                    >
                      <Image source={coinImage} style={styles.coinImage} />
                      <Text style={styles.coinName}>{coinName}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Modal>

            <Text style={{marginLeft: 10}}>Amount to Buy in USD</Text>
            <TextInput 
              value={String(amount)} 
              keyboardType='numeric'
              onChangeText={handleAmountChange}
           
  style={styles.inputField}
/>
<Button
  title="Instant Purchase"
  color="#001F3F"
  onPress={handleActualPurchase}
/>

            <Button title="Max" onPress={() => setAmount(balances.usd_balance)} />
            <Text style={{marginLeft: 10}}>Estimated Fee: ${estimatedFeeAndQuantity.fee.toFixed(2)}</Text>
        <Text style={{marginLeft: 10}}>Estimated Quantity: {estimatedFeeAndQuantity.quantity.toFixed(8)} {coin}</Text>
      
            <Button title="Close" onPress={() => {
              setLocalModalVisible(false);
              setModalVisible(false);
            }}/>
          </View>
        </View>
      </Modal>
      <TouchableOpacity style={styles.button} onPress={handleBuyPress}>
        <Text style={styles.buttonText}>Buy</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleSellPress}>
        <Text style={styles.buttonText}>Sell</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleChartPress}>
        <Text style={styles.buttonText}>Charts</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleHistoryPress}>
        <Text style={styles.buttonText}>History</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLeaderboardPress} >
        <Text style={styles.buttonText}>Leaderboard</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    position: 'absolute', 
    right: 0,
    top: '30%',
    alignItems: 'flex-end',
  },
  button: {
    marginBottom: 10,
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 10,
    zIndex: 1,
    position: 'relative',
  },
  buttonText: {
    fontSize: 16,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  coinSelectionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  coinImage: {
    width: 15,
    height: 15,
    marginRight: 10
  },
  pressed: {
    textDecorationLine: 'underline',
    color: 'blue',
  },
  notPressed: {
    textDecorationLine: 'underline',
    color: 'black',
  },
  
  dropdownButton: {
    width: '70%',  
    alignSelf: 'left',  
    marginTop: 10,
    marginLeft: 10,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },

  dropdownText: {
    fontSize: 16,
  },
  pressedDropdownText: {
    fontSize: 16,
    color: 'blue',
  },
  
  inputField: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  coinName: {
    fontSize: 18
  },
  botton: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    width: 50, 
    height: 100, 
    justifyContent: 'space-between', 
  },
  bottonImage: {
    flex: 4, 
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  bottonText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12, 
    color: '#000000'
  },
  bottonTextSelected: {
    flex: 1, 
    textAlign: 'center', 
    fontSize: 12, 
    color: '#FFFFFF' 
  },
  bottonSelected: {
    backgroundColor: darkBlue,
  },   
});

export default NavBar;
