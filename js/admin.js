console.clear();

// start-----訂單相關(管理者)-----
// 取得訂單資料
let ordersList = {};
function getOrdersList() {
    axios.get(`${apiBaseUrl}/api/livejs/v1/admin/${apiPath}/orders`,
        {headers:{
            'authorization':apiUid,
        }
    })
    .then(function (response) {
        ordersList = response.data.orders;
        renderOrdersList();
        renderChart();

    })
    .catch(function (error) {
        alert(error.response.data.message);
    });
}
// 渲染訂單資料
const jsOrdersList = document.querySelector('.js_ordersList');
function renderOrdersList() {
    jsOrdersList.innerHTML = ordersList.map(item => {
        // 訂單品項組合
        let productList = item.products.map(productItem =>
            `<p>${productItem.title}x${productItem.quantity}</p>`
        ).join('');
        // 改變訂單狀態顯示
        let orderStatus='';
        if (item.paid == true) {
            orderStatus = '已處理'
        }else{
            orderStatus = '未處理'
        };
        // 改變日期顯示
        const timeStamp = new Date(item.createdAt*1000);
        const orderDate = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDay()}`
        
        return `<tr>
                <td>${item.id}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                    ${productList}
                </td>
                <td>${orderDate}</td>
                <td class="orderStatus">
                    <a href="#" class = "js_orderStatus" data-order_status ="${item.paid}" data-order_id ="${item.id}" >${orderStatus}</a>
                </td>
                <td>
                    <input type="button" class="delSingleOrder-Btn js_orderDelete" data-order_id ="${item.id}" value="刪除">
                </td>
            </tr>`
}).join('');
}

jsOrdersList.addEventListener('click',function (e) {
    e.preventDefault();
    if (e.target.classList.contains('js_orderStatus')) {
        let order_id = e.target.dataset.order_id;
        let order_status = e.target.dataset.order_status;
        if (order_status == 'false') {
            order_status = true;
        }else{
            order_status =false ;
        }
        changeOrderStatus(order_id,order_status);
    }else if (e.target.classList.contains('js_orderDelete')) {
        let order_id = e.target.dataset.order_id;
        deleteOrder(order_id);
    }else{
        return;
    }
});
// 改變訂單狀態
function changeOrderStatus(order_id,order_status) {
    axios.put(`${apiBaseUrl}/api/livejs/v1/admin/${apiPath}/orders`,{
        "data": {
            "id": order_id,
            "paid": order_status
        }
    },
        {headers:{
            'authorization':apiUid,
        }
    })
    .then(function (response) {
        alert('修改成功');
        getOrdersList();
    })
    .catch(function (error) {
        alert(error.response.data.message);
    });
}
// 刪除訂單(單筆)
function deleteOrder(order_id) {
    axios.delete(`${apiBaseUrl}/api/livejs/v1/admin/${apiPath}/orders/${order_id}`,
        {headers:{
            'authorization':apiUid,
        }
    })
    .then(function (response) {
        alert('刪除成功');
        getOrdersList();
    })
    .catch(function (error) {
        alert(error.response.data.message);
    });
}

const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',function (e) {
    e.preventDefault();
    deleteAllOrders();
});
// 刪除訂單(全部)
function deleteAllOrders() {
    axios.delete(`${apiBaseUrl}/api/livejs/v1/admin/${apiPath}/orders`,
        {headers:{
            'authorization':apiUid,
        }
    })
    .then(function (response) {
        alert('全部刪除囉');
        getOrdersList();
    })
    .catch(function (error) {
        alert(error.response.data.message);
    });
}
// end-----訂單相關(管理者)-----

// 初始化
function init() {
    getOrdersList();
}
init();

// C3.js
function renderChart() {
    let categoryObj = {};
    ordersList.forEach(function (item) {
        item.products.forEach(function (productItem) {
            if (!categoryObj[productItem.category]) {
                categoryObj[productItem.category] = productItem.price*productItem.quantity;
            }else{
                categoryObj[productItem.category] += productItem.price*productItem.quantity;
            }
        });
    });
    
    let categoryIncome = Object.entries(categoryObj);
    console.log(categoryIncome);
    
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: categoryIncome,
            colors:{
                "窗簾":"#DACBFF",
                "床架":"#9D7FEA",
                "收納":"#5434A7",
                "其他":"#301E5F",
            }
        },
    });
};