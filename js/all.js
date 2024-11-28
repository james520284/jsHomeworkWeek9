console.clear();

// start-----產品相關(客戶)-----
// 取得API 產品資料
let originProductsData = [];
function getProductsData() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/products`)
    .then(function (response) {
        originProductsData = response.data.products;
        renderProductsList(originProductsData);
    })
    .catch(function (error) {
        alert(error.response.data.message);
    });
};
// 渲染產品列表
const productWrap = document.querySelector('.productWrap');
function renderProductsList(data) {
    let str ='';
    data.forEach(function (item) {
        str += `<li class="productCard">
                    <h4 class="productType">新品</h4>
                    <img src=${item.images} alt="">
                    <a href="#" class="addCardBtn" data-id=${item.id}>加入購物車</a>
                    <h3>${item.title}</h3>
                    <del class="originPrice">NT$${item.origin_price}</del>
                    <p class="nowPrice">NT$${item.price}</p>
                </li>`;
    });
    productWrap.innerHTML = str;
};
// 篩選產品
const productSelect = document.querySelector('.productSelect');
function filterProductsList() {
    productSelect.addEventListener('change',function (e) {
        if (e.target.value == '全部') {
            renderProductsList(originProductsData);
        }else{
            let filterProductsData = originProductsData.filter(function (item) {
                return e.target.value == item.category ;
            });
            renderProductsList(filterProductsData);
        };
    });
};
// end-----產品相關(客戶)-----



// start-----購物車相關(客戶)-----
// 取得API 購物車資料
let originCartsData = [];
let finalTotal = 0;
function getCartsData() {
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
    .then(function (response) {        
        originCartsData = response.data.carts;
        finalTotal = response.data.finalTotal;
        renderCartsList(originCartsData);
    })
    .catch(function (error) {
        alert(error.response.data.message);
    });
};
// 渲染購物車列表
const cartsList = document.querySelector('.cartsList');
const js_total = document.querySelector('.js_total');
function renderCartsList(data) {
    let str = '';
    data.forEach(function (item) {
        str +=`<tr>
                    <td>
                        <div class="cardItem-title">
                            <img src=${item.product.images} alt="">
                            <p>${item.product.title}</p>
                        </div>
                    </td>
                    <td>NT$${item.product.price}</td>
                    <td>${item.quantity}</td>
                    <td>NT$${item.product.price*item.quantity}</td>
                    <td class="discardBtn">
                        <a href="#" class="material-icons" data-cart_id = "${item.id}" data-product_name = "${item.product.title}">
                            clear
                        </a>
                    </td>
                </tr>`;
    });
    cartsList.innerHTML = str;
    js_total.innerHTML = `NT$${finalTotal}`;
};
// 加入購物車清單
productWrap.addEventListener('click',function (e) {
    e.preventDefault();
    let productId='';
    let numCheck = 1;
    if (e.target.getAttribute('class') !== 'addCardBtn') {
        return;
    }
    productId = e.target.getAttribute('data-id');
    originCartsData.forEach(function (item) {
        if (item.product.id == productId) {
            numCheck = ++item.quantity;
        };
    });
    postCartsData(productId,numCheck);
});
// 推送購物車資料到後端
function postCartsData(productId,numCheck) {
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`,{
        "data": {
            "productId": productId,
            "quantity": numCheck
        }
    })
    .then(function (response) {
        alert('成功加入購物車');
        getCartsData();
        renderCartsList(originCartsData);
    })
    .catch(function (error) {
        alert(error.response.data.message);
    });
};
// 刪除購物車(單筆)
cartsList.addEventListener('click',function (e) {
    e.preventDefault();
    const productName = e.target.dataset.product_name;
    const cartId = e.target.dataset.cart_id;
    if(cartId == null){
        return;
    };
    
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts/${cartId}`)
    .then(function (response) {        
        alert(`成功刪除購物車商品：${productName}`);
        getCartsData();
    })
    .catch(function (error) {
        alert(error.response.data.message);
    });
});
// 刪除購物車(所有)
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function (e) {
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/carts`)
    .then(function (response) {        
        alert(`成功刪除所有購物車商品`);
        getCartsData();
    })
    .catch(function (error) {
        alert('購物車已經沒有任何商品')
        alert(error.response.data.message);
    });
});
// end-----購物車相關(客戶)-----

// start-----訂單相關(客戶)-----
const orderInfoForm = document.querySelector('.orderInfo-form');
const orderInfoFormInput = orderInfoForm.querySelectorAll('.orderInfo-input');
const orderInfoMessage = orderInfoForm.querySelectorAll('.orderInfo-message');
const constraints = {
    "姓名":{
        presence:{
            message:'必填'
        }
    },
    "電話":{
        presence:{
            message:'必填'
        }
    },
    Email:{
        presence:{
            message:'必填'
        }
    },
    "寄送地址":{
        presence:{
            message:'必填'
        }
    }
};
let errors = validate(orderInfoForm,constraints);

orderInfoForm.addEventListener('submit',function (e) {
    e.preventDefault();
    // 表單驗證
    orderInfoFormInput.forEach(function (item) {
        if (!item.value) {
            Object.keys(errors).forEach(function (key) {
                if (key == item.nextElementSibling.dataset.message) {
                    item.nextElementSibling.textContent = `${errors[key]}`;
                }
            });
        }else{
            if (item.nextElementSibling) {
                item.nextElementSibling.textContent = '';
            }    
        }
    })

    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${apiPath}/orders`,{
        "data": {
            "user": {
            "name": orderInfoFormInput[0].value,
            "tel": orderInfoFormInput[1].value,
            "email": orderInfoFormInput[2].value,
            "address": orderInfoFormInput[3].value,
            "payment": orderInfoFormInput[4].value
            }
        }
    })
    .then(function (response) {
        alert('訂單送出成功');
        orderInfoForm.reset();
        getCartsData();
    })
    .catch(function (error) {
        console.log(error.response.data.message);
    });    
});
// end-----訂單相關(客戶)-----


// 資料初始化
function init() {
    getProductsData();
    filterProductsList();
    getCartsData();
};
init();
