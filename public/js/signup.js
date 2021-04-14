

/*변수 선언*/

$(function() {
    var id = document.querySelector('#id');

    var pw1 = document.querySelector('#pswd1');
    var pwMsg = document.querySelector('#alertTxt');
    var pwImg1 = document.querySelector('#pswd1_img1');

    var pw2 = document.querySelector('#pswd2');
    var pwImg2 = document.querySelector('#pswd2_img1');
    var pwMsgArea = document.querySelector('.int_pass');

    var gender = document.querySelector('#gender');
    var email = document.querySelector('#email');
    var mobile = document.querySelector('#mobile');
    var error = document.querySelectorAll('.error_next_box');

    /*이벤트 핸들러 연결*/

    id.addEventListener("focusout", checkId);
    pw1.addEventListener("focusout", checkPw);
    pw2.addEventListener("focusout", comparePw);
    // userName.addEventListener("focusout", checkName);
    // yy.addEventListener("focusout", isBirthCompleted);
    // mm.addEventListener("focusout", isBirthCompleted);
    // dd.addEventListener("focusout", isBirthCompleted);
    // gender.addEventListener("focusout", function() {
    //     if(gender.value === "성별") {
    //         error[5].style.display = "block";
    //     } else {
    //         error[5].style.display = "none";
    //     }
    // })
    email.addEventListener("focusout", isEmailCorrect);
    // mobile.addEventListener("focusout", checkPhoneNum);



    $("#btnJoin").click(function (){
        var userId = $("#id").val();
        var password = $("#pswd1").val();
        var passwordCheck = $("#pswd2").val();
        var email = $("#name").val();

        var addr = $("#addr").val();
        var recommender = $("#recommender").val();
        var marketingYn = $("#marketingYn").val();

        if( password != passwordCheck ) {
            alert("비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        var params = {
            userId: userId,
            password: password,
            email: email,
            address: addr,
            recommender: recommender,
            marketingYn: marketingYn
        }
        ajaxCall('/register', 'POST', params, 
        function(data) {
            
        }, 
        function(err) {
            console.log(err);
        })
    })
  
    $("#btnCheckIdDuplicate").click(function () {

        ajaxCallDataTypeHtml('http://localhost:9090/user/getIdentifyingPage', {}, 'GET',
        function(data) {
            console.log(data);
            openModal(data);
        }, function(err){
            console.log("err", err);
        } )
    });
    
    function openModal(html) {
        $(".nice-modal-area").show();

        $(".nice-modal-area .modal-content").html(html);
    }
});



/*콜백 함수*/
function isEmailCorrect() {

}

function checkPhoneNum() {}
function checkId() {
    var idPattern = /[a-zA-Z0-9_-]{5,20}/;
    if(id.value === "") {
        error[0].innerHTML = "필수 정보입니다.";
        error[0].style.display = "block";
    } else if(!idPattern.test(id.value)) {
        errorr[0].style.display = "block";
    } else {
        error[0].style.color = "#EFA543";
        error[0].style.display = "block";
    }
}

function checkPw() {
    var pwPattern = /[a-zA-Z0-9~!@#$%^&*()_+|<>?:{}]{8,16}/;
    if(pw1.value === "") {
        error[1].innerHTML = "필수 정보입니다.";
        error[1].style.display = "block";
    } else if(!pwPattern.test(pw1.value)) {
        error[1].innerHTML = "8~16자 영문 대 소문자, 숫자, 특수문자를 사용하세요.";
        pwMsg.innerHTML = "사용불가";
        pwMsgArea.style.paddingRight = "93px";
        error[1].style.display = "block";
        
        pwMsg.style.display = "block";
        } else {
        error[1].style.display = "none";
        pwMsg.innerHTML = "안전";
        pwMsg.style.display = "block";
        pwMsg.style.color = "#EFA543";
        pwImg1.src = "m_icon_safe.png";
    }
}

function comparePw() {
    if(pw2.value === pw1.value && pw2.value != "") {
        pwImg2.src = "m_icon_check_enable.png";
        error[2].style.display = "none";
    } else if(pw2.value !== pw1.value) {
        pwImg2.src = "m_icon_check_disable.png";
        error[2].innerHTML = "비밀번호가 일치하지 않습니다.";
        error[2].style.display = "block";
    } 

    if(pw2.value === "") {
        error[2].innerHTML = "필수 정보입니다.";
        error[2].style.display = "block";
    }
}

function checkName() {
    var namePattern = /[a-zA-Z가-힣]/;
    if(userName.value === "") {
        error[3].innerHTML = "필수 정보입니다.";
        error[3].style.display = "block";
    } else if(!namePattern.test(userName.value) || userName.value.indexOf(" ") > -1) {
        error[3].innerHTML = "한글과 영문 대 소문자를 사용하세요. (특수기호, 공백 사용 불가)";
        error[3].style.display = "block";
    } else {
        error[3].style.display = "none";
    }
}


function isBirthCompleted() {
    var yearPattern = /[0-9]{4}/;

    if(!yearPattern.test(yy.value)) {
        error[4].innerHTML = "태어난 년도 4자리를 정확하게 입력하세요.";
        error[4].style.display = "block";
    } else {
        isMonthSelected();
    }


    function isMonthSelected() {
        if(mm.value === "월") {
            error[4].innerHTML = "태어난 월을 선택하세요.";
        } else {
            isDateCompleted();
        }
    }

    function isDateCompleted() {
        if(dd.value === "") {
            error[4].innerHTML = "태어난 일(날짜) 2자리를 정확하게 입력하세요.";
        } else {
            isBirthRight();
        }
    }
}



function isBirthRight() {
    var datePattern = /\d{1,2}/;
    if(!datePattern.test(dd.value) || Number(dd.value)<1 || Number(dd.value)>31) {
        error[4].innerHTML = "생년월일을 다시 확인해주세요.";
    } else {
        checkAge();
    }
}
