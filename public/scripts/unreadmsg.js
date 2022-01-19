const newMsgLine = document.createElement('div');
newMsgLine.innerText = '여기서부터 읽지 않으셨습니다.'
newMsgLine.className += ' alert alert-danger'
newMsgLine.id = 'new-msg-line'; // div로 박스 나타내기

const newlineBtn = document.createElement('button');
newlineBtn.className += ' btn btn-alert alert alert-danger float-right mb-0 pt-0 pb-0'
newlineBtn.innerText = '확인'
newMsgLine.appendChild(newlineBtn); // div 내부에 버튼 넣어서 div 없앨 수 있게

newlineBtn.addEventListener('click', (e) => {
    newMsgLine.remove();
});

let currentPage = 0;
let inserted = false;

const loadMore = () => { // 맨 처음에 읽지 않은 부분까지, 이후로는 스크롤 다 올릴 때마다 호출 됨.
    // 처음엔 채널의 일부만 보여줌. 이후 스크롤을 올림에 따라 점점 더 보여줌.
    currentPage++;
    for(let i = 0; i < msgPerPage && readPos > 0; i++){
        msglist.insertBefore(msgElement(clientO, initialMsgs[readPos - 1]), msglist.children[0]); readPos--;
    }
    insertDivInList(); // msglist에 div를 삽입 가능하면 넣음. 아니면 보류.
    // if(readPos == 0) inserted = true;
}

const insertDivInList = () =>{
    if(inserted) return;
    else if(currentPage * msgPerPage >= insertPos){
        // console.log(msglist.childElementCount - insertPos);
        msglist.insertBefore(newMsgLine, msglist.children[msglist.childElementCount - insertPos]);
        //몇 번째에 넣을지 생각. 아래로부터 insertPos번째에 넣을 것.
        msglist.scrollTop = newMsgLine.offsetTop;//그 이후 스크롤 조정
        inserted = true;
    }
}

if(insertPos == 0) inserted = true;
loadMore();
while(!inserted){
    loadMore();
}
if(insertPos == 0) msglist.scrollTop = msglist.scrollHeight;


$(msglist).scroll(function(){
    let position = msglist.scrollTop;
    let height = msglist.scrollHeight;

    
    if(position <= 50){
        loadMore();
        msglist.scrollTop = msglist.scrollHeight - (height - msglist.scrollTop);
    }
    if(unread && msglist.scrollTop == msglist.scrollTopMax){
        unread = 0;
        botbtn.className += 'invisible';
    }
});


botbtn.addEventListener('click', (event) =>{
    msglist.scrollTop = msglist.scrollTopMax;
});