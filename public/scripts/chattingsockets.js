// 개별 채널 페이지(/channels/:channelId)에서 메시지와 관련된 내용을 담당하는 소켓 통신

const socket = io();
const sendbtn = document.getElementById('myPost'); // 보내기 버튼
let txt = document.getElementById('input-msg'); // 보낼 메시지 박스의 내용
txt.value = ''; // 빈 박스로 초기화

const sendNewMsg = async (e) => { // 메시지 보내기
    e.preventDefault(); // 기존 작업 방지
    if(txt.value.trim()){ // 불필요한 공백을 제한 뒤 메시지가 남는다면
        txt.value = txt.value.trim(); // 불필요한 공백 제거
        if(txt.value.length > 10000){ // 글자 수 제한 초과 시에
            alert('10000 글자 이하로 작성해주세요!'); return history.back();
        }
        const sendData = {
            id: clientO.id,
            nick: clientO.nick,
            msg: txt.value,
        }; // 보낼 데이터: id, 닉네임, 메시지가 포함 됨.
        socket.emit('new msg', sendData); // 소켓 통신
        txt.value = ''; // 보냈으니 메시지 박스 초기화
        msglist.scrollTop = msglist.scrollHeight; // 채닝 영역 스크롤을 맨 아래로 내림
    }
};

sendbtn.addEventListener('submit', sendNewMsg); // submit 버튼 이벤트 리스너
sendbtn.addEventListener('keydown', function(e){ // 유저의 설정(엔터로 메시지 전송)에 따라 반응
    if(sendWithEnter && e.key == "Enter" && !e.shiftKey){
        sendNewMsg(e);
    }
    else if(!sendWithEnter && e.key == "Enter" && e.shiftKey){
        sendNewMsg(e);
    }
});

let unread = 0;
socket.on(`update`, (receivedData) =>{ // 세 메시지 받으면
    let newMsg = msgElement(clientO, receivedData); // 클라이언트와 받은 데이터를 통해 메시지 element 생성

    const needScroll = ((msglist.scrollHeight - msglist.scrollTop - msglist.offsetHeight) <= 1);
    // 메시지를 받은 시점에 스크롤이 충분히 아래 쪽에 있는지 확인.
    // 충분히 아래 쪽이라면, 맨 아래로 자동스크롤 할 필요가 있음(메시지 받을 때마다 스크롤하는 것은 비정상)
    // 그렇지 않다면, 스크롤 유지(윗 부분을 보다가 갑자기 아래로 내려가기 방지)

    msglist.appendChild(newMsg); // 메시지 element를 추가
    
    if(needScroll) msglist.scrollTop = msglist.scrollHeight; // 스크롤 필요하면 스크롤
    else { // 아니라면 읽지 않은 메시지를 카운팅하며, 새 메시지가 왔다고 작게 알림.
        // 다만, 실제로 읽지 않은 메시지 카운트가 db 상에서 변하지는 않음.
        // 분명히 읽긴 읽은 것이나, 편의를 위한 카운팅임.
        unread++;
        botbtn.className = "";
        botbtn.children[0].textContent = unread; // botbtn을 내리면 맨 아래로 스크롤 됨.
    }
    socket.emit('read', clientO.id); // 읽었음을 알림. db에서 unread를 갱신.
});