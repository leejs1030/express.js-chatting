const socket = io();
const sendbtn = document.getElementById('myPost');
let txt = document.getElementById('input-msg');
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

let unread = 0;
socket.on(`update`, (receivedData) =>{
    let newMsg = msgElement(clientO, receivedData);

    const needScroll = ((msglist.scrollHeight - msglist.scrollTop - msglist.offsetHeight) <= 1);

    msglist.appendChild(newMsg);
    
    if(needScroll) msglist.scrollTop = msglist.scrollHeight;
    else {
        unread++;
        botbtn.className = "";
        botbtn.children[0].textContent = unread;
    }
    socket.emit('read', clientO.id);
});