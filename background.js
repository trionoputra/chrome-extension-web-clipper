
chrome.browserAction.onClicked.addListener(function(tab) {
  
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
   
        chrome.storage.sync.get(["isLogin"], function(data) {
            
            chrome.browserAction.setPopup({
                popup: data.isLogin === "logIn" ? "popup.html" : "login.html"
            });
        });

       chrome.runtime.onMessage.addListener (
        function (request, sender, sendResponse) {
            if (request.message === "postLogin") {
                chrome.browserAction.setPopup({popup: "popup.html"});
                sendResponse("success");
            }
            else if(request.message === "postLogout") {
                chrome.browserAction.setPopup({popup: "login.html"});
                sendResponse("success");
            }
        }
    );

    });
  });


  chrome.runtime.onMessage.addListener (
        function (request, sender, sendResponse) {
            if (request.message === "getScreen") {
               // getScreen();
               if(request.type === "full")
               {
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    var activeTab = tabs[0];
                    chrome.tabs.sendMessage(activeTab.id, {"message": "getScreen1"});
                  });
               }
               else
               {
                    getScreen()
               }

              sendResponse("success");
            }
            else if (request.message === "getContentPreview") {
                chrome.runtime.sendMessage({
                    message: "imgPreview",
                    data: request.data
                });
            }
        }
    );

  function getScreen()
  {
        chrome.tabs.captureVisibleTab(null, {
                 format : "png",
                 quality : 100
             }, function(data) {
            chrome.runtime.sendMessage({
                message: "imgPreview",
                data: data
            });

         });
  }

  chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
    chrome.tabs.executeScript(null,{file:"content.js"});
});

