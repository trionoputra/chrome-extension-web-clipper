//alert("Hello from your Chrome extension!");

chrome.runtime.onMessage.addListener (
    function (request, sender, sendResponse) {
        if (request.message === "getScreen1") {
           
            getScreen(sendResponse);
            
        }
    }
);

function getScreen(sendResponse)
{
    html2canvas(document.querySelector("body")).then(canvas => {
        var imgData = canvas.toDataURL('image/png');  
        chrome.runtime.sendMessage({message: "getContentPreview",data:imgData});
    });
}