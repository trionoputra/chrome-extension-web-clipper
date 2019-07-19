$(function(){
    $("button[name='button_logion']").click(function(){
        loginAjax($("input[name='username']").val(),$("input[name='password']").val());
    });
});

function loginAjax(username,password)
{
    $(".loading-button").show();
    $(".btn-login").hide();
    $.ajax({
        url: _url + "login",
        method:"POST",
        data: {
            username:username,
            password:password
        },
        success: function(result){
            $(".loading-button").hide();
            $(".btn-login").show();
            if(result.code === "00")
            {
                chrome.storage.local.set({"isLogin":"logIn",id:result.response.id,username:username,name:result.response.name,token:result.response.token}, function() {
                    chrome.runtime.sendMessage({message: "postLogin"},function(response){
                        window.location.href = "popup.html";
                    });
                });
            }
            else
            {
                $(".form-error").show();
                $(".form-error").html(result.message);
                setTimeout(function(){ $(".form-error").hide("slow")},2000);
            }
      }});
}

function loginLocal(username,password)
{
    
    if(username === "admin" && password === "admin")
    {
        chrome.storage.local.set({"isLogin":"logIn"}, function() {
            chrome.runtime.sendMessage({message: "postLogin"},function(response){
                window.location.href = "popup.html";
            });
        });
    }
    else
    {
        $(".form-error").show();
        $(".form-error").html("Invalid Username or Password");
        setTimeout(function(){ $(".form-error").hide("slow")},2000);
    }
    
}
