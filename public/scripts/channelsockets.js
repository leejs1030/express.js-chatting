let socket = io();

const channelList = document.getElementById('channel-list');


const createSocket = (id) => {
    socket.on(`update ${id}`, () =>{
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
};


for(e of clist){
    createSocket(e.id);
    const unread = document.getElementById(`C${e.id}unread`);
    const num = parseInt(unread.textContent);
    if(num) unread.className += ' text-danger font-weight-bold';
}

socket.on(`invite ${uid}`, (channelInfo) => {
    // const newChannel = document.createElement('div');
    // newChannel.id = `C${channelInfo.cid}`;
    // newChannel.className += ' row mb-3 col-12';
    // newChannel.innerHTML = `<div class="list-group-item col-11 h-100"><a class="h1" href="/channels/${channelInfo.cid}">${channelInfo.cname}</a>(읽지 않은 메시지: <span id="C${channelInfo.cid}unread" class=" text-danger font-weight-bold">${channelInfo.cunread}</span>)<span id="C${channelInfo.cid}NEW"></span><div class="float-right">최근 업데이트<br><span id="C${channelInfo.cid}time">${channelInfo.ctime}</span></div></div><span class="col-1 pb-0 pt-0"><a class="btn btn-warning w-100 h-50 text-center pt-0 pb-0" href="/channels/quit/4">나감</a></span>`
    // const getPos = binary_search(channelInfo.ctime);
    // channelList.insertBefore(newChannel, channelList.childNodes[getPos]);
    location.reload();
});