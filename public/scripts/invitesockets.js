// 초대 페이지 (/channels/:channelId/invitelist)에서 사용되는 소켓 통신
const socket = io();

for(e of friends){
    const targetId = e.id; // 상대방의 id
    const temp = document.getElementById(`invite${targetId}`); // 상대방의 id를 가지고 element를 가져옴
    console.log(`invite${targetId}`);
    temp.addEventListener('click', (event) =>{ // 클릭했을 때
        event.preventDefault(); // 원래 작업 방지
        console.log(targetId);
        socket.emit('invite', targetId); // 초대 소켓
        document.getElementById(targetId).remove(); // 초대 했으므로 보이는 초대 가능 리스트에서는 삭제
    })
}