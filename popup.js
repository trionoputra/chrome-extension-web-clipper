var $image;
var originalImageURL;
var uploadedImageName = 'cropped.jpg';
var uploadedImageType = 'image/jpeg';
var uploadedImageURL;
var token;
var id;

var myVar;
var timeCount = 0;
var data = {};
function myTimer() {
    if(timeCount >= 10)
    {
        alert("Full page required reload page");
        clearInterval(myVar);
    }

    timeCount++;
}


var options = {
    preview: '.img-preview',
    crop: function (e) {
     
    }
  };

var url
$(function(){

    chrome.tabs.getSelected(null, function(tab) {
        url = tab.url;
       // $(".current-url").html(url);
    });

    $(".logout").click(function(){
        logout();
    });

    var quill = new Quill('#editor-container', {
        modules: {
          syntax: true,
          toolbar: '#toolbar-container'
        },
        placeholder: 'Compose an epic...',
        theme: 'snow'
    });

    quill.on('text-change', function(delta, oldDelta, source) {
         chrome.storage.local.set({"body":quill.root.innerHTML});
      });

    $(".loading").show();
    chrome.runtime.sendMessage({message: "getScreen",type:$("input[name='viewType']:checked").val()});
    
    $("input[name='viewType']").click(function(){
        $(".loading").show();
        chrome.runtime.sendMessage({message: "getScreen",type:$("input[name='viewType']:checked").val()});
        clearInterval(myVar);
        myVar = setInterval(myTimer, 1000);
    });

    $(".btn-download").click(function(){
        if($image != null)
        {   
            var date = new Date()
            var day = date.getDate();
            var month = date.getMonth();
            var year = date.getFullYear();
            var hour = date.getHours();
            var minute = date.getMinutes();
            var second = date.getSeconds();

            canvas = $image.cropper('getCroppedCanvas');
            img = canvas.toDataURL("image/jpg");
           
            var a = document.createElement('a');
            a.href = img;
            a.download = 'KebalenTools_Preview_'+ year +"_" + month + "_" + day + "_" + hour + "" + minute + "" + second + '.jpg';
           
            a.click(); 
        }
    });
    

    $('input[name="page_name"]').keyup(function(){
        chrome.storage.local.set({"page_name":$('input[name="page_name"]').val()});
    });
    
    chrome.storage.local.get(["page_name","tag_name","body","token","name","id"],function(item){
        $('input[name="page_name"]').val(item.page_name);
        $('input[name="tag_name"]').val(item.tag_name);
        $('input[name="tag_name"]').tagsInput({width:'auto',height:"40px",'onChange' : function(data){
            chrome.storage.local.set({"tag_name":$(data).val()});
        }});
        
        if(item.body)
            quill.root.innerHTML = item.body;

        token = item.token;
        id = item.id;
        $("#view-name").html(item.name);
        checkSession();
    });


    $("button[name='button_save']").click(function(){

       
        $(".loading-button").show();
        $(".button-save-ajax").hide();
        canvas = $image.cropper('getCroppedCanvas');
        img = canvas.toDataURL("image/jpg");

        let data = {
                content:quill.root.innerHTML,
                name : $('input[name="page_name"]').val(),
                tags : $('input[name="tag_name"]').val() != "" ? $('input[name="tag_name"]').val().split(",") : "",
                user_id:id,
                image: img,
                
            }

            $.ajax({
                url: _url + "document",
                method:"POST",
                data:data,
                headers: {"Access-Token": token},
                success: function(result){
                     
                    $(".loading-button").hide();
                    $(".button-save-ajax").show();
                    if(result.code === "00")
                    {
                        $(".message-outer").show();
                        $(".message-wraper").attr("class","message-wraper message-success");
                        $(".message-wraper").html("Data Saved!");
                        $('input[name="page_name"]').val("");
                        quill.root.innerHTML = "";
                        chrome.storage.local.set({"page_name":"","body":""});
                    }
                    else if(result.code === "01")
                    {
                        $(".message-outer").show();
                        $(".message-wraper").attr("class","message-wraper message-error");
                        $(".message-wraper").html(result.message);
                    }
                    else if(result.code === "02")
                    {
                        result.message.forEach(function(a){
                            key = Object.keys(a)[0];
                            fm = $(".form-group."+key);
                            fm.addClass("form-error");
                            fm.find("span").html(a[key]);
                        })  
                    }

                    setTimeout(function(){
                        $(".message-outer").hide();
                        $(".message-wraper").html("");
                    },2000);

              }});
    });

});


function checkSession()
{
    $.ajax({
        url: _url + "check",
        method:"POST",
        headers: {"Access-Token": token},
        success: function(result){
            
            if(result.code === "00")
            {
                if(result.message == "Invalid Token")
                    logout();
            }
            else
            {
                logout();
            }
      }});
}

function logout()
{
    chrome.storage.local.set({"isLogin":"",username:"",name:"",token:""}, function() {
        chrome.runtime.sendMessage({message: "postLogout"},function(response){
            window.location.href = "login.html";
        });
    });
}

function initCrop()
{
    $(".loading").hide();
    if($image != null)
        $image.cropper('destroy');
    
    $image = $('#image-preview');
    originalImageURL = $image.attr('src');
    $image.on({
        ready: function (e) {
           imageData = $image.cropper("getImageData");
           containerData = $image.cropper("getContainerData");
           cropBox = $image.cropper("getCropBoxData");

           cropBox.width = imageData.width;
           cropBox.height = imageData.height;

           if(imageData.width > imageData.height)
           { 
             cropBox.top = (containerData.height - imageData.height) / 2
           }
           else if(imageData.width < imageData.height)
           {
            cropBox.left = (containerData.width - imageData.width) / 2
           }

           $image.cropper("setCropBoxData",cropBox);

        },
        cropstart: function (e) {
          console.log(e.type, e.detail.action);
        },
        cropmove: function (e) {
          console.log(e.type, e.detail.action);
        },
        cropend: function (e) {
          console.log(e.type, e.detail.action);
        },
        crop: function (e) {
          console.log(e.type);
        },
        zoom: function (e) {
          console.log(e.type, e.detail.ratio);
        }
    }).cropper(options);

    $("button[name='btn-zoom-plus']").click(function(){ $image.cropper("zoom", 0.1)  });
    $("button[name='btn-zoom-min']").click(function(){ $image.cropper("zoom", -0.1)  });

    $("button[name='btn-move']").click(function(){ $image.cropper("setDragMode", "move")  });
    $("button[name='btn-drag']").click(function(){ $image.cropper("setDragMode", "crop")  });

    $("button[name='btn-rotate45']").click(function(){ $image.cropper("rotate", 45)  });
    $("button[name='btn-rotate-min45']").click(function(){ $image.cropper("rotate", -45)  });

    $("button[name='btn-flip-v']").click(function(){
        var scale = $(this).attr("scaley") == 1 ? -1 : 1;
       
        $image.cropper("scaleY", scale ) ;
        $(this).attr("scaley",scale)
        
    });
    $("button[name='btn-flip-h']").click(function(){
        var scale = $(this).attr("scalex") == 1 ? -1 : 1;
        $image.cropper("scaleX", scale ) ;
        $(this).attr("scalex",scale) 
    });

    $("button[name='btn-rasio16']").click(function(){ 
        options['aspectRatio'] = 1.7777777777777777;
        $image.cropper('destroy').cropper(options);
     });

     $("button[name='btn-rasio4']").click(function(){ 
        options['aspectRatio'] = 1.3333333333333333;
        $image.cropper('destroy').cropper(options);
     });

     $("button[name='btn-rasio1']").click(function(){ 
        options['aspectRatio'] = 1;
        $image.cropper('destroy').cropper(options);
     });

     $("button[name='btn-rasio2']").click(function(){ 
        options['aspectRatio'] = 1.6666666666666666;
        $image.cropper('destroy').cropper(options);
     });
     $("button[name='btn-rasiofree']").click(function(){ 
        options['aspectRatio'] = NaN;
        $image.cropper('destroy').cropper(options);
     });

}

chrome.runtime.onMessage.addListener (
    function (request, sender, sendResponse) {
        if (request.message === "imgPreview") {
            clearInterval(myVar);
            $("#image-preview").attr("src",request.data);
            initCrop();
        }
    }
);
