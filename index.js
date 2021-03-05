const CART_PRODUCTOS = "cartProductsId";

document.addEventListener("DOMContentLoaded", () => { //aca se inicializan todas aquellas funciones q queremos q se cargue con datos guardados en el localStorage por ej
    loadProducts();
    loadProductCart();
});

function getProductsDb(){
    const url= "..//dbProducts.json"; //guardamos la base de datos del JSON en un variable

    return fetch(url) // hace la llamada a la constante url 
    .then(response => {
        return response.json();
    })
    .then(result => {
        return result;
    })
    .catch(err => {
        console.log(err);
    });
}

async function loadProducts() {
    const products = await getProductsDb();
    let html = '';

    products.forEach(product => { //recorre cada elemento de la DB de los productos y los muestra a traves de la variable product
        html += ` 
           <div class="col-3 product-container"> 
                <div class="card product"> 
                    <img
                        src="${product.image}"
                        class="card-img-top"
                        alt="${product.name}"
                    >
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.extraInfo}</p>
                        <p class="card-text">${product.price} $  / Unidad</p>
                        <button type="button" class="btn btn-primary btn-cart" onClick=(addProductCart(${product.id}))>Añadir al carrito</button>
                    </div>
                </div>
           </div>
        `;
    });
    
    document.getElementsByClassName("products")[0].innerHTML = html;
    
}

function openCloseCart() {
    const  containerCart = document.getElementsByClassName("cart-products")[0];
    containerCart.classList.forEach (item => {
        if(item === "hidden"){
            containerCart.classList.remove("hidden");
            containerCart.classList.add('active');
        }
        if(item === "active"){
            containerCart.classList.remove("active");
        containerCart.classList.add('hidden');
        }
        /* hidden - active utilizado para hacer una visualizacion del contenido del carrito*/
    })
}

function addProductCart(idProduct) {
    let arrayProductsId = [];
    let localStorageItems =  localStorage.getItem(CART_PRODUCTOS);

    if(localStorageItems === null){
        arrayProductsId.push(idProduct);
        localStorage.setItem(CART_PRODUCTOS, arrayProductsId);
    }
    else {
        let productsId = localStorage.getItem(CART_PRODUCTOS);
        if(productsId.length > 0) {
            productsId += ","+ idProduct;
        }
        else { productsId = productsId;}
            
        localStorage.setItem(CART_PRODUCTOS, productsId);
    }
    loadProductCart(); // se va a llamar cada vez q se seleccione añadir un producto al carrito
}

async function loadProductCart() {
    const products = await getProductsDb();

    //convertir en array el contenido de localStorage
    const localStorageItems = localStorage.getItem(CART_PRODUCTOS);
    let html = "";

    if(!localStorageItems){
        html = `
            <div class="cart-product empty">
                <p>Carrito Vacio.</p>
            </div>
        `;
    } 
    else {
        const idProductsSplit = localStorageItems.split(",");

        // eliminamos los id duplicados
        const idProductsCart = Array.from(new Set(idProductsSplit)); //esta funcion elimina todo lo q sean duplicados
        
        
        idProductsCart.forEach (id => { //recorre cada id de cada producto, una sola vez
            products.forEach(product => {
                if(id == product.id){
                    const quantity = countDuplicatesId(id, idProductsSplit);
                    const totalPrice = product.price * quantity;
                    html += `
                        <div class="cart-product"> 
                            <img
                                src="${product.image}" class="card-img-top" alt="${product.name}">
                            <div class="cart-product-info">
                                <span class="quantity">${quantity}</span>
                                <p>${product.name}</p>
                                <p>${totalPrice.toFixed(2)}</p>
                                <p class="change-quantify">
                                    <button onClick="decreaseQuantity(${product.id})">-</button>
                                    <button onClick="increaseQuantity(${product.id})">+</button>
                                </p>
                                <p class="cart-product-delete">
                                    <button onClick=(deleteProductCart(${product.id}))>Eliminar</button>
                                </p>
                            </div> 
                        </div>
                `;
                }
            });
        });
    }

    document.getElementsByClassName("cart-products")[0].innerHTML = html;
}

function deleteProductCart(idProduct) {
    const idProductsCart = localStorage.getItem(CART_PRODUCTOS);
    const arrayIdProductsCart = idProductsCart.split(','); //pasa el contenido del local a un Array
    const resultIdDelete = deleteAllIds(idProduct, arrayIdProductsCart);

    if(resultIdDelete) {
        let count = 0;
        let idsString = "";

        resultIdDelete.forEach (id => {
            count++;

            if(count < resultIdDelete.length){
                idsString += id + ',';
            } 
            else { idsString+= id ;}
        })
        localStorage.setItem(CART_PRODUCTOS, idsString);
    }
    const idsLocalStorage = localStorage.getItem(CART_PRODUCTOS);
    if(!idsLocalStorage) {
        localStorage.removeItem(CART_PRODUCTOS);
    }

    loadProductCart();
}

function increaseQuantity(idProduct) {
    const idProductsCart = localStorage.getItem(CART_PRODUCTOS);
    const arrayIdProductsCart = idProductsCart.split(",");
    arrayIdProductsCart.push(idProduct);

    let count = 0;
    let idsString = "";
    arrayIdProductsCart.forEach(id => {
        count++;
        if(count < arrayIdProductsCart.length){
            idsString+= id + ",";
        }
        else { idsString+=id; }
    });
    localStorage.setItem(CART_PRODUCTOS, idsString);
    loadProductCart();
}

function decreaseQuantity(idProduct) {
    const idProductsCart = localStorage.getItem(CART_PRODUCTOS);
    const arrayIdProductsCart = idProductsCart.split(",");
    
    const deleteItem = idProduct.toString(); //convertir el id en un string
    let index = arrayIdProductsCart.indexOf(deleteItem) // saca el index de la variable deleteItem
    if(index > -1){ //condicion que nos dice q si existe un index
        arrayIdProductsCart.splice(index, 1);
    }

    let count = 0;
    let idsString = "";
    arrayIdProductsCart.forEach ( id => {
        count ++;
        if(count < arrayIdProductsCart.length) {
            idsString += id + ",";
        } 
        else { idsString +=id;}
    });
    localStorage.setItem(CART_PRODUCTOS, idsString);
    loadProductCart();
}

function countDuplicatesId(value, arrayIds) {  // hacemos la suma de la cantidad de productos y del precio total de un producto determinado
    let count = 0;
    arrayIds.forEach( id => {
        if(value == id) { count ++ ;}
    });
    return count;
}

function deleteAllIds(id, arrayIds) {
    return arrayIds.filter(itemId => { //filtra y devuelve solo los id que no coincidan el id recibido en parametro
        return itemId != id;
    });
}