$(function() {

    $("button").click(function() {
        console.log(this);
        var id = $(this).attr("id");
        switch(id){
            case "btnLogin":
                loginRequest();
                break;
        }
    })
})

function loginRequest(){
    var userId = $("#loginFormUserId").val();
    var password = $("#loginFormUserPassword").val();
 
    if(userId == '' || userId == undefined || userId.trim() == ''){
        //TODO: Open alert modal
        alert('아이디를 입력해주세요');
        return false;
    }   
    if(password == '' || password == undefined || password.trim() == ''){
        //TODO: Open alert modal
        alert('비밀번호를 입력해주세요');
        return false;
    } 

    var params = {
        userId: userId,
        password: password
    }
    ajaxCall('/user/login', params, 'POST'
    , function(data) {
        console.log("login success", data);
        // TODO: Open alert moodal
        location.reload();
    }, function(err) {
        console.log("login failed", err);
    })
}