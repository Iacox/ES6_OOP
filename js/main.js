// (имитация базы данных)
/*
/addToBasket.json – добавить товар в корзину;
/deleteFromBasket.json – удалить товар из корзины.
*/
const API_URL = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses'
const image = 'https://placehold.it/200x150'
const cartImage = 'https://placehold.it/100x80'
const CATALOG_URL = '/catalogData.json'
const CART_URL = '/getBasket.json'


class List {
    constructor(url, container) {
        this.container = container
        this.url = url
        this.items = [] // то, что запрашиваем с сети
        this.filteredItems = [];
        this.allItems = [] // то, что сохраняем локально
        this._init()
    }
    _init() {
        return false
    }
    getJSON(url = `${API_URL + this.url}`) {
        return fetch(url)
            .then(result => result.json())
            .catch(err => { console.error(err) })
    }
    handleData(data) {
        this.items = [...data]
        this.filteredItems = [...data]
        this.render()
    }
    render(el = this.items) {
        const block = document.querySelector(this.container)
        el.forEach(item => {
            const product = new lists[this.constructor.name](item)
            this.allItems.push(product)
            block.insertAdjacentHTML('beforeend', product.render())
        })
    }
}

class Item {
    constructor(el, img = image) {
        this.product_name = el.product_name
        this.price = el.price
        this.id_product = el.id_product
        this.img = img
    }
    render() {
        return `<div class="product-item" data-id="${this.id_product}">
            <img src="${this.img}" alt="Some img">
            <div class="desc">
                <h3>${this.product_name}</h3>
                <p>${this.price} $</p>
                <button class="buy-btn"
                data-id="${this.id_product}"
                data-name="${this.product_name}"
                data-image="${this.img}"
                data-price="${this.price}">Купить</button>
            </div>
        </div>`
    }
}

class CatalogItem extends Item { }

class CartItem extends Item {
    constructor(el, img = cartImage) {
        super(el, img)
        this.quantity = el.quantity
    }
    render() {
        return `<div class="cart-item" data-id="${this.id_product}">
            <div class="product-bio">
                <img src="${this.img}" alt="Some image">
                <div class="product-desc">
                    <p class="product-title">${this.product_name}</p>
                    <p class="product-quantity">Quantity: ${this.quantity}</p>
                    <p class="product-single-price">$${this.price} each</p>
                </div>
            </div>
            <div class="right-block">
                <p class="product-price">${this.quantity * this.price}$</p>
                <button class="del-btn" data-id="${this.id_product}">&times;</button>
            </div>
        </div>`
    }
}

class Catalog extends List {
    constructor(cart, url = CATALOG_URL, container = '.products') {
        super(url, container)
        this.cart = cart
        this.getJSON()
            .then(data => this.handleData(data))
        this._initFilter()
    }
    filterItems(value) {
        const regexp = new RegExp(value, 'i')
        this.filteredItems = this.items.filter(item => regexp.test(item.product_name))
        if (this.filteredItems.length === 0) {
            document.querySelector(this.container).innerHTML = 'К сожалению, по вашему запросу ничего не найдено =('
        } else {
            document.querySelector(this.container).innerHTML = ''
            this.render(this.filteredItems)
        }
    }
    _initFilter() {
        document.querySelector('.search-field').addEventListener('change', () => {
            let value = document.querySelector('.search-field').value
            this.filterItems(value)
        })
    }
    _init() {
        document.querySelector(this.container).addEventListener('click', event => {
            if (event.target.classList.contains('buy-btn')) {
                this.cart.addProduct (event.target)
            }
        })
    }
}

class Cart extends List {
    constructor(url = CART_URL, container = '.cart-block') {
        super(url, container)
        this.getJSON()
            .then(data => this.handleData(data.contents))
    }
    addProduct(element) {
        this.getJSON(API_URL + '/addToBasket.json')
            .then(response => {
                if (response.result) {
                    let prodId = +element.dataset['id']
                    let find = this.allItems.find(item => item.id_product === prodId)

                    if (find) {
                        find.quantity++
                        this._updateCart(find)
                    } else {
                        let product = [ {
                            id_product: prodId,
                            price: +element.dataset['price'],
                            product_name: element.dataset['name'],
                            img: element.dataset['image'],
                            quantity: 1
                        } ]
                        //this.allItems.push(product)
                        this.render(product)
                    }
                }
            })
    }
    removeProduct(element) {
        this.getJSON(API_URL + '/deleteFromBasket.json')
            .then(response => {
                if (response.result) {
                    let prodId = +element.dataset['id']
                    let find = this.allItems.find(item => item.id_product === prodId)

                    if (find.quantity > 1) {
                        find.quantity = find.quantity - 1
                        this._updateCart(find)
                    } else {
                        this.allItems.splice(this.allItems.indexOf(find), 1)
                        element.remove()
                    }
                }
            })
    }
    _updateCart(product) {
        let block = document.querySelector(this.container)
        let id = this.allItems.indexOf(product)
        block.querySelectorAll('.product-quantity')[id].textContent = `Quantity: ${product.quantity}`
        block.querySelectorAll('.product-price')[id].textContent = `${product.quantity * product.price}$`
    }
    _init() {
        document.querySelector('.btn-cart').addEventListener('click', () => {
            document.querySelector(this.container).classList.toggle('invisible')
        })
        document.querySelector(this.container).addEventListener('click', event => {
            if (event.target.classList.contains('del-btn')) {
                this.removeProduct(event.target.parentNode.parentNode)
            }
        })
    }
}

let lists = {
    Catalog: Item,
    Cart: CartItem
}



//глобальные сущности корзины и каталога (ИМИТАЦИЯ! НЕЛЬЗЯ ТАК ДЕЛАТЬ!)
let cart = new Cart()
let catalog = new Catalog(cart)

//list.fetchItems()
//    .then(() => {
//        list.render()
//    })
//    .catch((error) => {
//        console.error(error)
//    })


//кнопка скрытия и показа корзины
//document.querySelector('.btn-cart').addEventListener('click', () => {
//    document.querySelector('.cart-block').classList.toggle('invisible')
//});
////кнопки удаления товара (добавляется один раз)
//document.querySelector('.cart-block').addEventListener('click', (evt) => {
//    if (evt.target.classList.contains('del-btn')) {
//        userCart.del(evt.target)
//    }
//})
////кнопки покупки товара (добавляется один раз)
//document.querySelector('.products').addEventListener('click', (evt) => {
//    if (evt.target.classList.contains('buy-btn')) {
//        userCart.add(evt.target)
//    }
//})

//const items = ['Notebook', 'Display', 'Keyboard', 'Mouse', 'Phones', 'Router', 'USB-camera', 'Gamepad']
//const prices = [1000, 200, 20, 10, 25, 30, 18, 24]
//const ids = [1, 2, 3, 4, 5, 6, 7, 8]

//


//const makeGETRequest = (url) => {
//    return new Promise((resolve, reject) => {
//        let xhr

//        if (window.XMLHttpRequest) {
//            xhr = new XMLHttpRequest()
//        } else if (window.ActiveXObject) {
//            xhr = new ActiveXObject("Microsoft.XMLHTTP")
//        }

//        xhr.onreadystatechange = function () {
//            if ((xhr.readyState === 4) && (xhr.status === 200)) {
//                resolve(xhr.responseText)
//            } else if (xhr.status === 404) {
//                reject("Запрашиваемый ресурс не найден, проверьте данные запроса.")
//            } else if (xhr.status === 500) {
//                reject("На сервере произошла ошибка, попоробуйте повторить запрос.")
//            }
//        }

//        xhr.open('GET', url, true)
//        xhr.send()
//    })
//}

//let request = fetch(`${API_URL}/catalogData.json`)
//                .then((data) => data.json()).then(dataParsed => { console.log(dataParsed) })
//                .catch((err) => {
//                    console.error(err)
//                })

//class Product {
//    constructor(img = image) {
//        this.img = img
//        this.quantity = 0
//    }
    
//    add() {
//        this.quantity++
//    }
    
//    render() {
//        return `<div class="product-item" data-id="${this.id_product}">
//                        <img src="${this.img}" alt="Some img"> 
//                        <div class="desc">
//                            <h3>${this.product_name}</h3>
//                            <p>${this.price} $</p>
//                            <button class="buy-btn" 
//                            data-id="${this.id_product}"
//                            data-name="${this.product_name}"
//                            data-image="${this.img}"
//                            data-price="${this.price}">Купить</button>
//                        </div>
//                    </div>`
//    }
//}


//class ProductList {
//    constructor() {
//        this.items = []
//    }
    
//    fetchItems() {
//        return new Promise((resolve, reject) => {
//            let request = fetch(`${API_URL}/catalogData.json`)
//                .then((data) => data.json()).then((items) => {
//                    this.items = items
//                    this.items.forEach(item => item.__proto__ = new Product)
//                    resolve(this.items)
//                })
//                .catch((err) => {
//                    console.error(err)
//                })
//        })
//    }
    
//    render() {
//        let listHtml = '';
//        this.items.forEach(item => listHtml += item.render())
//        document.querySelector('.products').innerHTML += listHtml
//    }
//}

////CART

//class CartProduct {
//    constructor(id, name, price, img = cartImage) {
//        this.id = id
//        this.name = name
//        this.price = price
//        this.img = img
//        this.quantity = 1
//    }
    
//    render() {
//        return `<div class="cart-item" data-id="${this.id}">
//                    <div class="product-bio">
//                        <img src="${this.img}" alt="Some image">
//                        <div class="product-desc">
//                            <p class="product-title">${this.name}</p>
//                            <p class="product-quantity">Quantity: ${this.quantity}</p>
//                            <p class="product-single-price">$${this.price} each</p>
//                        </div>
//                    </div>
//                    <div class="right-block">
//                        <p class="product-price">${this.quantity * this.price}$</p>
//                        <button class="del-btn" data-id="${this.id}">&times;</button>
//                    </div>
//                </div>`
//    }
//}

//class UserCart {
//    constructor() {
//        this.cart = []
//    }
    
//    add(product) {
//        let itemId = +product.dataset['id']
//        let findItem = this.cart.find(el => el.id === itemId)
        
//        if (!findItem) {
//            this.cart.push(new CartProduct(itemId, product.dataset['name'], +product.dataset['price']))
//        }  else {
//            findItem.quantity++
//        }
        
//        this.render()
//    }
    
//    del(product) {
//        let itemId = +product.dataset['id']
//        let findItem = this.cart.find(el => el.id === itemId)
        
//        if (findItem.quantity > 1) {
//            findItem.quantity--;
//        } else {
//            this.cart.splice(this.cart.indexOf(findItem), 1);
//            document.querySelector(`.cart-item[data-id="${itemId}"]`).remove()
//        }
        
//        this.render()
//    }
    
//    countSum() {
//        let sum = 0
//        this.cart.forEach(item => {sum += item.quantity * item.price})
//        return sum
//    }
    
//    render() {
//        let choosenItems = ''
//        if (this.countSum() === 0) {
//            choosenItems += 'Не выбран ни один товар.'
//        } else {
//            this.cart.forEach(item => choosenItems += item.render())
//            choosenItems += `<hr><div>Суммарная стоимость всех товаров: ${this.countSum()}$</div>`
//        }
//        document.querySelector(`.cart-block`).innerHTML = choosenItems
//    }
//}