const socket = io();
const sendbtn = document.getElementById('myPost');
let txt = document.getElementById('input-msg');
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
    let newMsg = msgElement(clientO, receivedData);

    let clientScrolls = msglist.clientHeight + msglist.scrollTop;
    let totalScrolls = msglist.scrollHeight;
    const checkToScroll = totalScrolls - clientScrolls;

    msglist.appendChild(newMsg);
    console.log(newMsg);
    
    if(checkToScroll <= 100) msglist.scrollTop = totalScrolls;
    else unread++;
    socket.emit('read', clientO.id);
});