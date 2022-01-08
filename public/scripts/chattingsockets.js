const socket = io();
const sendbtn = document.getElementById('myPost');
let txt = document.getElementById('input_msg');



const sendNewMsg = (e) => {
    // console.log("이벤트리스너2");
    // console.log('유저정보');
    e.preventDefault();
    // console.log(e);
    // console.log(txt.value.length);
    if(txt.value){
        if(txt.value.length > 20000){
            // txt.value = '';
            return sendbtn.submit();
        }
        // console.log(`txt.value is : ${txt.value}`);
        const sendData = {
            id: clientO.id,
            nick: clientO.nick,
            channel: clientO.channel,
            msg: txt.value,
        };
        socket.emit('new msg', sendData);
        txt.value = '';
    }
}

sendbtn.addEventListener('submit', sendNewMsg);
sendbtn.addEventListener('keydown', function(e){
    if(sendWithEnter && e.key == "Enter" && !e.shiftKey){
        sendNewMsg(e);
        // sendbtn.submit();
    }
    else if(!sendWithEnter && e.key == "Enter" && e.shiftKey){
        sendNewMsg(e);
    }
});

socket.on(`update ${clientO.channel}`, (receivedData) =>{
    const msglist = document.getElementById('botScroll');
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
    socket.emit('read', clientO.id, clientO.channel);
})