var app = new Vue({
    el: 'main',
    data: {
        RESOURCE_SERVER,
        orderList: []
    }, methods: {
        numberFormat,
        formatDate,
        convertOrderStatus
    }
})

$(function() {
    getOrderList();
})

function getOrderList() {
    ajaxCallWithLogin(API_SERVER + '/order/getPurchaseOrderListByUserId', {}, 'POST',
    function(data) {
        var result = data.result;
        console.log(result);
        app.orderList = result;

    }, function(err) {
        console.log(err);
    }, {
        isRequired: true,
        userId: true
    })
}

function formatDate(dateStr) {
    var date = new Date(dateStr);
    var month = '' + (date.getMonth() + 1);
    month = (month.length < 2)?'0'+month: month;
    
    var day = '' + (date.getDate());
    day = (day.length < 2)?'0'+day: day;
    return month + '-' + day;
}

function convertOrderStatus(orderStatus) {
    switch(orderStatus) {
        case 'C':
            return '구매확정';
        case 'XC':
            return '취소완료';
        case 'X':
            return '취소신청';
        case 'S':
            return '배송준비중';
        case 'P':
            return '결제 완료';
        case 'D':
            return '배송중';
    }
    
}