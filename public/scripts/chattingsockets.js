const socket = io();
const sendbtn = document.getElementById('myPost');
let txt = document.getElementById('input-msg');
const msglist = document.getElementById('botScroll');
const botbtn = document.getElementById('botbtn');
txt.value = '';

const sendNewMsg = async (e) => {
    e.preventDefault();
    if(txt.value.trim()){
        txt.value = txt.value.trim();
        if(txt.value.length > 10000){
            alert('10000 글자 이하로 작성해주세요!'); history.back();
        }
        const sendData = {
            id: clientO.id,
            nick: clientO.nick,
            msg: txt.value,
        };
        socket.emit('new msg', sendData);
        txt.value = '';
        msglist.scrollTop = msglist.scrollHeight;
    }
};

sendbtn.addEventListener('submit', sendNewMsg);
sendbtn.addEventListener('keydown', function(e){
    if(sendWithEnter && e.key == "Enter" && !e.shiftKey){
        sendNewMsg(e);
    }
    else if(!sendWithEnter && e.key == "Enter" && e.shiftKey){
        sendNewMsg(e);
    }
});

socket.on(`update`, (receivedData) =>{
    let newMsg = document.createElement('span');

    let clientScrolls = msglist.clientHeight + msglist.scrollTop;
    let totalScrolls = msglist.scrollHeight;
    const checkToScroll = totalScrolls - clientScrolls;

    if(clientO.id == receivedData.id){
        newMsg.innerHTML = (`<div class="list-group-item mb-0"><div class="text-danger font-weight-bold h5">${receivedData.id}(${receivedData.nick}):</div><div id="pre-wrap">${receivedData.msg}</div></div><span class="float-right text-right mb-2 h6">${receivedData.stime}에 전송됨</span>`);
    }
    else{
        newMsg.innerHTML = (`<div class="list-group-item mb-0"><div class="text-info">${receivedData.id}(${receivedData.nick}):</div><div id="pre-wrap">${receivedData.msg}</div></div><span class="float-right text-right mb-2 h6">${receivedData.stime}에 전송됨</span>`);
    }
    msglist.appendChild(newMsg);
    
    if(checkToScroll <= 100) msglist.scrollTop = totalScrolls;
    else unread++;
    socket.emit('read', clientO.id);
});