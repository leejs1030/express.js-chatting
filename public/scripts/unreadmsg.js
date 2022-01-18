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

    {} //메시지 로드하기
    
    insertDivInList(); // msglist에 div를 삽입 가능하면 넣음. 아니면 보류.
}

const insertDivInList = () =>{
    if(inserted) return;
    if(currentPage * numPerPage >= newUnread){
        msglist.insertBefore(null, newMsgLine); //몇 번째에 넣을지 생각. 아래로부터 insertPos번째에 넣을 것.
        //그 이후 스크롤 조정
        inserted = true;
    }
}

while(!inserted){
    loadMore();
}