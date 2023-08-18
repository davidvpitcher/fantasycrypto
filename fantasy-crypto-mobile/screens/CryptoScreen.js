import React, { useState, useEffect } from 'react'; 
import { View, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NavBar from './NavBar';

const CryptoScreen = () => {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [balances, setBalances] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [latestPrices, setLatestPrices] = useState({});
  const [netWorth, setNetWorth] = useState(0); 
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedUserId = await AsyncStorage.getItem('userId');
  
      if (storedUsername) {
        setUsername(storedUsername);
      }
  
      if (storedUserId) {
        setUserId(storedUserId);
        fetchAssetsAndPrices(storedUserId);  
      }
    };
  
    fetchUserData();
  }, []);
  
  const fetchAssetsAndPrices = async (userId) => {

    const assets = axios.post('https://www.mortalitycore.com/includes/react_get_user_assets.inc.php', {
      userId: userId,
    }, {
      headers: {
        Authorization: `Bearer ${await AsyncStorage.getItem('jwt')}`,
      },
    });
    
    const prices = axios.get('https://www.mortalitycore.com/includes/react_get_latest_prices.inc.php');
  
    Promise.all([assets, prices]).then((results) => {
      const assetsData = results[0].data;
      const pricesData = results[1].data;

      setBalances(assetsData);
      setLatestPrices(pricesData);
      
      calculateNetWorth(assetsData, pricesData);
    }).catch((error) => {
      console.error(error);
    });
  };
  

const calculateNetWorth = (balances, prices) => {


    let worth = 0;
    worth += Number(balances.usd_balance) || 0;

    worth += (Number(balances.bitcoin_balance) || 0) * (Number(prices.BTC) || 0);

    worth += (Number(balances.ethereum_balance) || 0) * (Number(prices.ETH) || 0);

    worth += (Number(balances.litecoin_balance) || 0) * (Number(prices.LTC) || 0);

    worth += (Number(balances.dogecoin_balance) || 0) * (Number(prices.Doge) || 0);

    worth += (Number(balances.cardano_balance) || 0) * (Number(prices.ADA) || 0);

    worth += (Number(balances.polkadot_balance) || 0) * (Number(prices.DOT) || 0);

    setNetWorth(worth);
  }
  
  return (
    <View >
 <NavBar 
      setModalVisible={setModalVisible} 
      balances={balances} 
      prices={latestPrices}  
      userId={userId} 
      refreshBalances={() => fetchAssetsAndPrices(userId)} 
    
      />
    <Text style={{ marginLeft: 20 }}>Welcome, {username}</Text>
  
    <Text style={{ 
  textAlign: 'center', 
  fontWeight: 'bold', 
  fontSize: 20, 
  color: 'white',
  backgroundColor: 'navy', 
  marginTop: 10,
  padding: 10
}}>
    Welcome to Fantasy Crypto!{"\n"}
  Real market data, pretend balances!
</Text>

    <Text style={{ textAlign: 'left', fontWeight: 'normal', fontSize: 20, color: 'black', marginTop: 5, marginLeft: 10 }}>
  Your pretend networth:{"\n"} ${Number(netWorth).toFixed(2)} USD
</Text>
<Text style={{ textAlign: 'left', fontWeight: 'normal', fontSize: 15, color: 'black', marginLeft: 10, marginTop: 5 }}>
  Your pretend balances: 
</Text>
{
  balances.usd_balance > 0 &&
  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 10 }}>
    <Image source={require('../assets/images/usflag.png')} style={{ width: 20, height: 20 }} />
    <Text style={{ width: 100 }}>USD:</Text>
    <Text>${balances.usd_balance}</Text>
  </View>
}

{
  balances.bitcoin_balance > 0 &&
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
    <Image source={require('../assets/images/Bitcoin.png')} style={{ width: 20, height: 20 }} />
    <Text style={{ width: 100 }}>Bitcoin:</Text>
    <Text>{balances.bitcoin_balance} BTC</Text>
  </View>
}

{
  balances.ethereum_balance > 0 &&
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
    <Image source={require('../assets/images/Ethereum.png')} style={{ width: 20, height: 20 }} />
    <Text style={{ width: 100 }}>Ethereum:</Text>
    <Text>{balances.ethereum_balance} ETH</Text>
  </View>
}

{
  balances.litecoin_balance > 0 &&
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
    <Image source={require('../assets/images/Litecoin.png')} style={{ width: 20, height: 20 }} />
    <Text style={{ width: 100 }}>Litecoin:</Text>
    <Text>{balances.litecoin_balance} LTC</Text>
  </View>
}

{
  balances.dogecoin_balance > 0 &&
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
    <Image source={require('../assets/images/Dogecoin.png')} style={{ width: 20, height: 20 }} />
    <Text style={{ width: 100 }}>Dogecoin:</Text>
    <Text>{balances.dogecoin_balance} Doge</Text>
  </View>
}

{
  balances.cardano_balance > 0 &&
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
    <Image source={require('../assets/images/Cardano.png')} style={{ width: 20, height: 20 }} />
    <Text style={{ width: 100 }}>Cardano:</Text>
    <Text>{balances.cardano_balance} ADA</Text>
  </View>
}

{
  balances.polkadot_balance > 0 &&
  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
    <Image source={require('../assets/images/Polkadot.png')} style={{ width: 20, height: 20 }} />
    <Text style={{ width: 100 }}>Polkadot:</Text>
    <Text>{balances.polkadot_balance} DOT</Text>
  </View>
}

<Text style={{ textAlign: 'left', fontWeight: 'normal', fontSize: 15, color: 'black', marginLeft: 10, marginTop: 5 }}>
  Latest prices: 
</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 10 }}>
        <Image source={require('../assets/images/Bitcoin.png')} style={{ width: 20, height: 20 }} />
        <Text style={{ width: 100 }}>Bitcoin:</Text>
        <Text>${latestPrices.BTC}</Text>
      </View>
  
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
        <Image source={require('../assets/images/Ethereum.png')} style={{ width: 20, height: 20 }} />
        <Text style={{ width: 100 }}>Ethereum:</Text>
        <Text>${latestPrices.ETH}</Text>
      </View>
  
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
        <Image source={require('../assets/images/Litecoin.png')} style={{ width: 20, height: 20 }} />
        <Text style={{ width: 100 }}>Litecoin:</Text>
        <Text>${latestPrices.LTC}</Text>
      </View>
  
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
        <Image source={require('../assets/images/Dogecoin.png')} style={{ width: 20, height: 20 }} />
        <Text style={{ width: 100 }}>Dogecoin:</Text>
        <Text>${latestPrices.Doge}</Text>
      </View>
  
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
        <Image source={require('../assets/images/Cardano.png')} style={{ width: 20, height: 20 }} />
        <Text style={{ width: 100 }}>Cardano:</Text>
        <Text>${latestPrices.ADA}</Text>
      </View>
  
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
        <Image source={require('../assets/images/Polkadot.png')} style={{ width: 20, height: 20 }} />
        <Text style={{ width: 100 }}>Polkadot:</Text>
        <Text>${latestPrices.DOT}</Text>
      </View>
    </View>
  );
  
}

export default CryptoScreen;
