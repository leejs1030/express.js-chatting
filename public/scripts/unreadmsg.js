const newMsgLine = document.createElement('div');
newMsgLine.innerText = '여기서부터 읽지 않으셨습니다.'
newMsgLine.className += ' alert alert-danger'
newMsgLine.id = 'new-msg-line'; // div로 박스 나타내기
// 읽지 않은 메시지를 구분하는 기준선이 되는 div 박스.

const newlineBtn = document.createElement('button');
newlineBtn.className += ' btn btn-alert alert alert-danger float-right mb-0 pt-0 pb-0'
newlineBtn.innerText = '확인'
newMsgLine.appendChild(newlineBtn); // div 박스(newMsgLine) 내부에 버튼 넣어서 div 없앨 수 있게.

newlineBtn.addEventListener('click', (e) => { // 없애기 위한 이벤트리스너
    newMsgLine.remove();
});

let currentPage = 0; // 현재 페이지. 메시지가 몇 페이지나 로딩되었는지 확인.
let inserted = false; // div 박스(newMsgLine)이 삽입 되었는지 안 되었는지 나타내는 bool값

const loadMore = () => { // 맨 처음에 읽지 않은 부분까지, 이후로는 스크롤 다 올릴 때마다 호출 됨.
    // 처음엔 채널의 일부만 보여줌. 이후 스크롤을 올림에 따라 점점 더 보여줌.
    currentPage++;
    for(let i = 0; i < msgPerPage && readPos > 0; i++, readPos--){ // readPos: 초기(페이지 첫 렌더링 기준)에 읽지 않은 메시지 수.
        // 페이지에 필요한 메시지 수를 충족하거나, 더 이상 읽을 메시지가 남지 않을 떄까지 반복해서 로드.
        msglist.insertBefore(msgElement(clientO, initialMsgs[readPos - 1]), msglist.children[0]); // 새 메시지를 맨 위에 추가.
    }
    insertDivInList(); // msglist에 div를 삽입 가능하면 넣음. 아니면 보류.
}

const insertDivInList = () =>{
    if(inserted) return; // 이미 newMsgLine을 삽입했다면 끝.
    else if(msglist.childElementCount >= insertPos){ // 넣어야 할 메시지의 위치보다 더 많은 양의 메시지를 로드했다면 삽입하기
        msglist.insertBefore(newMsgLine, msglist.children[msglist.childElementCount - insertPos]);
        //몇 번째에 넣을지 생각. 아래로부터 insertPos번째에 넣을 것.
        msglist.scrollTop = newMsgLine.offsetTop;//그 이후 스크롤 조정
        inserted = true;
    }
}

if(insertPos == 0) inserted = true; // insertPos가 0이면 이미 다 읽은 것.
// 따라서 newMsgLine을 삽입할 필요가 없으므로 그냥 넣었다고 치기
loadMore(); // 맨처음엔 그래도 로드를 하긴 해야함.
while(!inserted){ // 아직 삽입하지 않았다면
    loadMore(); // 추가로 로드
}
if(insertPos == 0) msglist.scrollTop = msglist.scrollHeight; // insertPos가 0이므로, 삽입하지 않은 경우.
// 그냥 맨 아래로 스크롤을 내리면 됨.


// $(msglist).scroll(function(){
msglist.addEventListener('scroll', () => {
    let position = msglist.scrollTop;
    let height = msglist.scrollHeight;

    
    if(position <= 50){ // 충분히 위로 올렸다면
        loadMore(); // 메시지를 더 로드하고
        msglist.scrollTop = msglist.scrollHeight - (height - position); // 스크롤 위치를 유지.
        // 유지한다: 로드하기 전에 보던 화면과 로드한 후에 보이는 화면이 같도록 만들어 준다.
    }
    if(unread && ((msglist.scrollHeight - msglist.scrollTop - msglist.offsetHeight) <= 1)){ // unread 메시지가 있고 충분히 아래로 내렸다면
        unread = 0; // unread를 읽었음으로 처리하고
        botbtn.className += 'invisible'; // botbtn을 안 보이게 처리
    }
});

// botbtn: unread 메시지 관리함.
botbtn.addEventListener('click', (event) =>{ // botbtn 을 누르면
    msglist.scrollTop = msglist.scrollHeight; // 맨 아래로 스크롤
});