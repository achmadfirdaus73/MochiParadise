const { createApp, ref, computed, onMounted } = Vue;
const { createVuetify } = Vuetify;

const vuetify = createVuetify();

const firebaseConfig = {
  apiKey: "AIzaSyATKGWgpPymBNi6HJtBI1o0nPEZeU2oj8I",
  authDomain: "ecomercee-61005.firebaseapp.com",
  projectId: "ecomercee-61005",
  storageBucket: "ecomercee-61005.appspot.com",
  messagingSenderId: "52783610614",
  appId: "1:52783610614:web:2f1f84389fdcabf3c34ad7",
  measurementId: "G-4FSESRLDV9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

createApp({
  setup() {
    const products = ref([]);
    
    // [MODIFIKASI] State 'isSearchVisible' sudah tidak diperlukan dan dihapus
    const isCartDrawerOpen = ref(false);
    const cartItems = ref([]);
    const searchTerm = ref('');
    const snackbar = ref({ show: false, text: '', color: 'success' });
    
    onMounted(() => {
      const productsCollection = db.collection('products');
      productsCollection.onSnapshot(snapshot => {
        console.log("Data dari Firebase diterima!");
        products.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }, error => {
        console.error("Error mengambil data dari Firebase: ", error);
      });
    });
    
    const cartTotal = computed(() => cartItems.value.reduce((total, item) => total + item.price, 0));
    
    const filteredProducts = computed(() => {
      if (!searchTerm.value) return products.value;
      return products.value.filter(p => p.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
    });
    
    const productRows = computed(() => {
      const allProducts = filteredProducts.value;
      const rows = [];
      const configs = [
        { itemsPerRow: 2, cols: { xs: 12, sm: 6, md: 6 } },
        { itemsPerRow: 4, cols: { xs: 6, sm: 6, md: 3 } }
      ];
      let currentIndex = 0;
      for (const config of configs) {
        if (currentIndex >= allProducts.length) break;
        const sliceEnd = currentIndex + config.itemsPerRow;
        rows.push({ products: allProducts.slice(currentIndex, sliceEnd), cols: config.cols });
        currentIndex = sliceEnd;
      }
      return rows;
    });
    
    function addToCart(product) {
      cartItems.value.push(product);
      snackbar.value.show = true;
      snackbar.value.text = `${product.name} berhasil ditambahkan!`;
      snackbar.value.color = 'success';
    }
    
    function removeFromCart(itemIndex) {
      const removedItem = cartItems.value.splice(itemIndex, 1);
      snackbar.value.show = true;
      snackbar.value.text = `${removedItem[0].name} dihapus dari keranjang.`;
      snackbar.value.color = 'error';
    }
    
    function processPreOrder() {
      const phoneNumber = '6285691009132';
      let message = 'Halo Mochi Paradise, saya mau pre-order:\n\n';
      cartItems.value.forEach(item => {
        message += `- ${item.name}\n`;
      });
      message += `\nTotal Harga: *Rp${cartTotal.value.toLocaleString('id-ID')}*`;
      message += '\n\nMohon info selanjutnya ya. Terima kasih!';
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
    
    return {
      products,
      searchTerm,
      productRows,
      addToCart,
      snackbar,
      isCartDrawerOpen,
      cartItems,
      cartTotal,
      processPreOrder,
      removeFromCart
    };
  }
}).use(vuetify).mount('#app');