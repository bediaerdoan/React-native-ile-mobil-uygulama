import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TextInput } from 'react-native-paper';
import { auth } from './firebase';


const GirisScreen = ({}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handlePasswordReset = () => {
    if (email === '') {
      alert('Lütfen e-posta adresinizi girin.');
      return;
    }

    auth
      .sendPasswordResetEmail(email)
      .then(() => {
        alert('Şifre sıfırlama e-postası gönderildi. Lütfen e-posta hesabınızı kontrol edin.');
      })
      .catch((error) => {
        alert('Şifre sıfırlama e-postası gönderilirken bir hata oluştu.');
        console.error(error);
      });
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigation.navigate('Anasayfa');
      }
    });
    return unsubscribe;
  }, []);

  const handleSignUp = () => {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log('Registered with:', user.email);
      })
      .catch((error) => alert(error.message));
  };

  const handleLogin = () => {
    auth
      .signInWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log('Logged in with:', user.email);
      })
      .catch((error) => alert(error.message));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonText}>GİRİŞ</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSignUp} style={[styles.button, styles.buttonOutline]}>
          <Text style={styles.buttonOutlineText}>KAYIT OL</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePasswordReset} style={[styles.button, styles.buttonOutline]}>
          <Text style={styles.buttonOutlineText}>ŞİFRE SIFIRLAMA</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const HomeScreen = ({  }) => {
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [totalSpent, setTotalSpent] = useState(0);

  const addProduct = () => {
    if (productName === '' || productPrice === '') {
      alert('Ürün adı ve fiyatı girmelisiniz.');
      return;
    }

    const newProduct = { name: productName, price: parseFloat(productPrice), isBought: false };
    setProducts([...products, newProduct]);
    setProductName('');
    setProductPrice('');
  };

  const deleteProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const toggleProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts[index].isBought = !updatedProducts[index].isBought;
    setProducts(updatedProducts);
  };

  useEffect(() => {
    let total = 0;
    products.forEach((product) => {
      if (product.isBought) {
        total += product.price;
      }
    });
    setTotalSpent(total);
  }, [products]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={styles.totalSpent}>Toplam Harcama: {totalSpent.toFixed(2)} TL</Text>
      <View style={styles.productContainer}>
        {products.map((product, index) => (
          <View key={index} style={styles.productItem}>
            <Text style={product.isBought ? styles.productNameBought : styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price.toFixed(2)} TL</Text>
            <TouchableOpacity onPress={() => toggleProduct(index)} style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>{product.isBought ? 'İptal' : 'Tamamlandı'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteProduct(index)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Sil</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={styles.addProductContainer}>
        <TextInput
          placeholder="Ürün Adı"
          value={productName}
          onChangeText={(text) => setProductName(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Ürün Fiyatı (TL)"
          value={productPrice}
          onChangeText={(text) => setProductPrice(text)}
          style={styles.input}
        />
        <TouchableOpacity onPress={addProduct} style={styles.addButton}>
          <Text style={styles.addButtonLabel}>Ürün Ekle</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const YardimSayfasi = ({  }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>  Uygulamamız alışveriş yaparken rahat etmemiz için tasarlanmıştır. Ürünlerinizin adını girip ardından ücretinide girerek bir liste oluşturmanıza yardımcı olur. Toplam ücretin ne kadar olduğunu kasada yanlışlık yapılıp yapılmadığını gösterir.    </Text>
        <Text>    </Text>
       <Text>Bir olay olması durumunda iletişime geçilecek mail adresi</Text>
       <Text>    </Text>
       <Text>Email: {auth.currentUser?.email}</Text>
    </View>
  );
};

const ProfilScreen = () => {
  const handleSignOut = () => {
    auth
      .signOut()
      .catch(error => alert(error.message))
  }

  const handleDeleteAccount = () => {
    auth
      .currentUser
      .delete()
      .catch(error => alert(error.message))
  }

  return (
    <View style = {styles.container}>
      <Text>Email: {auth.currentUser?.email}</Text>
      <TouchableOpacity
        onPress={handleSignOut}
        style={styles.button}
      >
        <Text style={styles.buttonText}>ÇIKIŞ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleDeleteAccount}
        style={styles.button}
      >
        <Text style={styles.buttonText}>HESABI SİL</Text>
      </TouchableOpacity>
    </View>
  )
}

const AuthStack = createStackNavigator();

const AuthStackScreen = () => (
  <AuthStack.Navigator>
    <AuthStack.Screen name="Giriş" component={GirisScreen} />
  </AuthStack.Navigator>
);

const TabStack = createBottomTabNavigator();

const TabStackScreen = () => (
  <TabStack.Navigator>
    <TabStack.Screen name="Home" component={HomeScreen} />
    <TabStack.Screen name="Yardım" component={YardimSayfasi} />
    <TabStack.Screen name="Profil" component={ProfilScreen} />
  </TabStack.Navigator>
);

const App = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsSignedIn(!!user);
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      {isSignedIn ? <TabStackScreen /> : <AuthStackScreen />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 7,
    borderRadius: 5,
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    backgroundColor: '#e6e6fa',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: '#e6e6fa',
    marginTop: 10,
    borderColor: '#e6e6fa',
    borderWidth: 5,
  },
  buttonText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
  totalSpent: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  productContainer: {
    width: '80%',
    marginBottom: 20,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
  },
  productNameBought: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    backgroundColor: '#e6e6fa',
    padding: 5,
    borderRadius: 5,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  deleteButton: {
    backgroundColor: '#e6e6fa',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  addProductContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButton: {
    backgroundColor: '#e6e6fa',
    padding: 10,
    borderRadius: 5,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailText: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#e6e6fa',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default App;