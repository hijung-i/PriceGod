var product = {};
var selectedOptions = new Array();
var isExtra = false, isJeju = false;

var app = new Vue({
    el: 'main',
    data: {
        RESOURCE_SERVER,
        selectedOptions,
        product: product,
        optionTotalPrice: 0,
        orderDTO: {},
        deliveryGroupList: []
    }, methods: {
        numberFormat,
        deleteFromArray,
        changeOptionCount,
        onSubmit: function() {
            location.href="/order?deliveryGroupList=" + JSON.stringify(app.deliveryGroupList)+'&orderDTO='+ JSON.stringify(app.orderDTO);
        }
    }
});
$(function() {

    getProductDetail();

    $('ul.tab_wrap li').click(function() {
        var activeTab = $(this).attr('data-tab');
        $('.tab_wrap li').removeClass('active');
        $('.tab_cont').removeClass('active');
        $(this).addClass('active');
        $('#' + activeTab).addClass('active');
    })

    $("select#products").change(function() {
        onOptionSelected($(this));
    });

    $("button.c_btn").click(addCart);

    $(document).ready(function() {
           $('.multiple_bxslider').bxSlider({
            mode: 'horizontal',
            auto: true,
            slideWidth: 4000,
            infiniteLoop: true,
            controls:true,
            pager: false,
            minSlides:2.5,
            maxSlides:4.5,
            slideMargin:4
        });
  
     });
       $(function() {
        $('ul.tab_wrap #tab li').click(function() {
            var activeTab = $(this).attr('data-tab');
            $('.tab_wrap li').removeClass('active');
            
            
            $('.tab_cont').removeClass('active');
            
            $(this).addClass('active');
            $('#' + activeTab).addClass('active');
        })
        
        $('ul.tab_wrap #tab li').click(function() {
            var activeTab = $(this).attr('data-tab');
            $('.tab_wrap li').removeClass('active');
            
            $('.tab_cont').removeClass('active');
            
            $(this).addClass('active');
            $('#' + activeTab).addClass('active');
            
            $('#tab1').addClass('active');
        })
    });

    ajaxCall('/user/login', {}, 'GET', 
    function( data ){
        console.log("data", data);
        if(data.result.isLoggedIn == true) {
            checkDeliveryAddress();
        }
    }, function(err) {
        console.log("error", err);
    })

})

function getProductDetail(){
    var productCode = $("#productCode").val();

    var params = {
        productCode: productCode
    }

    ajaxCallWithLogin(API_SERVER + '/product/getProductDetail', params, 'POST'
    , function (data) {
        product = data.result;
        app.product = product;
        if(product == undefined || product.length == 0){
            // TODO: Open alert modal
            return false;
        }
        console.log(product);
        
        app.product.discountRate = Math.round(product.discountRate);
        // 상품명
        $('.detail_title h2').html(product.productName);
        $('.v_top_name').html(product.productName);
        $('.infoArea01 .product_name_css .con span').html(product.productName);

        // 가격 정보
        var productDesc = $('.v_top_txt')
        var discountPrice = $('.v_top_txt_box .price_mobile .p1')
        var retailPrice = $('.v_top_txt_box .price_mobile .p2')
        var discountRate = $('.v_top_txt_box .price_mobile .p3')
        productDesc.html(product.productDesc);
        discountPrice.html(numberFormat(product.discountPrice)+'원');
        
        if(product.discountPrice != product.retailPrice){
            retailPrice.html(numberFormat(product.retailPrice)+'원');
            discountRate.html(numberFormat(Math.round(product.discountRate, 0))+'%');
        } else {
            $('.v_top_txt_box .p1').hide()
            $('.v_top_txt_box .p3').hide();
        }

        // v_n_top_info
        $(".v_n_top_info .point .ex").html()
        $(".v_n_top_info .courier-name .ex").html(product.deliveryCompany);
        
        var deliveryCostHtml = '';
        if(product.deliveryCostBasis == 0){
            deliveryCostHtml = '무료배송';
        } else if(product.deliveryCostBasis < 999999) {
            deliveryCostHtml = numberFormat(product.deliveryCostBasis)+'원 이상 구매시 무료배송';
        } else {
            deliveryCostHtml = numberFormat(product.deliveryCost); 
            if(product.deliveryCost3 != 0) {
                deliveryCostHtml += ' ~ ' + numberFormat(product.deliveryCost3) + '원';
            }
        }
        $('.v_n_top_info .delivery-cost .ex').html(deliveryCostHtml);

        var packingTypeHtml = '';
        if (product.packingType == 'A') packingTypeHtml = '상온 (종이박스)';
        else if (product.packingType == 'B') packingTypeHtml = '냉장 (아이스박스)';
        $('.v_n_top_info .packing-type .ex').html(packingTypeHtml);

    }, function (err) {
        console.log("productDetail error", err);
    }, {
        isRequired: false,
        userId : true
    })
}

function addCart() {
    console.log(selectedOptions);
    var params = {
        options: selectedOptions
    }

    ajaxCallWithLogin(API_SERVER + '/order/addCart', params, 'POST',
    function(data) {
        alert("장바구니에 추가되었습니다.");
        console.log("addCart success", data);
    }, function(err) {
        if(err.responseText == 'NOT_MATCHED') {
            alert("이미 장바구니에 해당 옵션이 존재합니다.");
        } else {
            alert("장바구니 추가에 실패했습니다.");
        }
        console.log("addCart error", err);
    }, {
        isRequired: true,
        userId: true
    })
}

function onOptionSelected(element) {
    var selectedIndex = $(element)[0].options.selectedIndex -1;
    var selectedOption = product.options[selectedIndex];

    // 깊은 복사
    var option = JSON.parse(JSON.stringify(selectedOption));
    option.optionCount = 1;

    if(!isExistsInArray(option)) {
        option.isSelected = true;
        selectedOptions.push(option);
        
    }
    drawSelectedOptions();
}

function isExistsInArray(option) {
    for(var i =0; i < selectedOptions.length; i++){
        if(option.optionDesc == selectedOptions[i].optionDesc) {
            return true;
        }
    }
    return false;
}

function changeOptionCount(plus, index) {
    var optionCount = app.selectedOptions[index].optionCount;
    if(plus) {
        optionCount ++;
    } else {
        if((optionCount - 1) <= 0) {
            alert('옵션은 1개 이상 선택해야합니다.');
            optionCount = 1;
        } else {
            optionCount -= 1;
        }
    }
    app.selectedOptions[index].optionCount = optionCount;
    drawSelectedOptions();
}

function getSelectedOptionIndex(ele) {
    var optionBox = ele.parent().parent().parent().parent();
    var id = $(optionBox).find(".product_title").attr("id");
    return id.substring('seq_'.length);
}

function drawSelectedOptions() {

    var totalPrice = 0;
    for(var i = 0; i < app.selectedOptions.length; i++) {
        var option = app.selectedOptions[i];
        totalPrice += option.optionDiscountPrice * option.optionCount;
    }
    app.optionTotalPrice = totalPrice;
    
    var requestDeliveryGroupList = new Array();
    var deliveryGroup = new DeliveryGroupDTO();

    var product = JSON.parse(JSON.stringify(app.product));
    product.options = selectedOptions;
    
    deliveryGroup.products.push(product);
    deliveryGroup.loadingPlace = product.loadingPlace;
    deliveryGroup.brandCode = product.brandCode;
    deliveryGroup.companyName = product.companyName;
    deliveryGroup.brandName = product.brandName;
    deliveryGroup.setDeliveryCost(isJeju, isExtra);

    console.log(deliveryGroup.totalDeliveryCost);
    if(selectedOptions.length < 1) {
        alert('상품을 선택해주세요.')
        return false;
    }

    requestDeliveryGroupList.push(deliveryGroup);

    app.orderDTO = {
        paymentTotalAmount: deliveryGroup.groupPrice,
        totalDeliveryCost: deliveryGroup.totalDeliveryCost
    }
    app.deliveryGroupList = requestDeliveryGroupList;
}

function deleteFromArray(seq) {
    selectedOptions.splice(seq, 1);
    drawSelectedOptions();
}

function checkDeliveryAddress() {
    var params = {};
    
    ajaxCallWithLogin(API_SERVER + '/user/checkDeliveryAddress', params, 'POST',
    function(data) {
        var result = data.result;

        if(result.address.includes('제주특별자치도')) {
            isJeju = true;
        } 
        if(result.count > 0) {
            isExtra = true;
        }
    }, function(err) {
        console.log("error", err);
    }, {
        isRequired: true,
        userId: true
    })
}