let socket = io();

const channelList = document.getElementById('channel-list');

const getTime = (pos) => {return channelList.children[pos].getElementsByClassName('time-info')[0].textContent;}

const parametric = (i, x) => {
    if(i > x) return true;
    else return false;
}

const binary_search = (ctime) =>{
    let left = 0, right = channelList.childElementCount - 1, middle = (left + right) >> 1;
    let result = -1;
    while(left <= right){
        if(parametric(getTime(middle), ctime)){
            result = middle;
            left = middle + 1;
        }
        else{
            right = middle - 1;
        }
        middle = (left + right) >> 1;
    }
    return result;
}



socket.on(`update`, (receiveData) =>{
    console.log('hi');
    const id = receiveData.channel;
    const unread = document.getElementById(`C${id}unread`);
    unread.textContent = parseInt(unread.textContent) + 1;
    if(!("text-danger" in unread.classList))unread.className += ' text-danger font-weight-bold';
    const newbox = document.getElementById(`C${id}NEW`);
    if(!("alert" in newbox.classList)) newbox.className += ' alert alert-danger';
    newbox.textContent = "NEW!";
    const target = document.getElementById(`C${id}`);
    target.remove();
    channelList.insertBefore(target, channelList.childNodes[0]);
});


for(e of clist){
    // createSocket(e.id);
    const unread = document.getElementById(`C${e.id}unread`);
    const num = parseInt(unread.textContent);
    if(num) unread.className += ' text-danger font-weight-bold';
}

socket.on(`invite`, (channelInfo) => {
    const newChannel = document.createElement('div');
    newChannel.id = `C${channelInfo.cid}`;
    newChannel.className += ' row mb-3 col-12';
    newChannel.innerHTML = `<div class="list-group-item col-11 h-100"><a class="h1" href="/channels/${channelInfo.cid}">${channelInfo.cname}</a>(읽지 않은 메시지: <span id="C${channelInfo.cid}unread" class=" text-danger font-weight-bold">${channelInfo.cunread}</span>)<span id="C${channelInfo.cid}NEW"></span><div class="float-right">최근 업데이트<br><span id="C${channelInfo.cid}time">${channelInfo.ctime}</span></div></div><span class="col-1 pb-0 pt-0"><a class="btn btn-warning w-100 h-50 text-center pt-0 pb-0" href="/channels/quit/${channelInfo.cid}">나감</a></span>`
    const getPos = binary_search(channelInfo.ctime);
    if(getPos != -1) channelList.insertBefore(newChannel, channelList.childNodes[getPos].nextSibling);
    else channelList.insertBefore(newChannel, channelList.childNodes[0]);
    socket.emit('join to');
});