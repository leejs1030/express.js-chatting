// 채널 목록 페이지(/channels) 에서 사용하게 될 소켓과 관련된 내용.
let socket = io();

const channelList = document.getElementById('channel-list');

const getTime = (pos) => {return channelList.children[pos].getElementsByClassName('time-info')[0].textContent;}
// pos번째 채널의 시간 가져오기

const parametric = (i, x) => { // 파라메트릭 서치, 이분탐색을 위해 사용됨
    if(i > x) return true;
    else return false;
}

const binary_search = (ctime) =>{ // 이분 탐색
    // 새로 초대받은 채널이 시간 내림차순 정렬에서 몇 번째에 들어가야할지 이분 탐색으로 정해줌.
    // 기존 리스트는 시간이 내림차순으로 정렬 됨. (큰 시간 -> 작은시간) (최신 -> 이전)
    // 기준보다 더 큰가?           OOOOOOOOOOOOXXXXXXXXXXXX
    // X는 더 작거나 같은 것들. 시간이 더 작거나 같으므로 이전의 것.
    // O는 더 큰 것들. 시간이 크므로 더 최근의 것.
    let left = 0, right = channelList.childElementCount - 1, middle = (left + right) >> 1;
    let result = -1;
    while(left <= right){
        if(parametric(getTime(middle), ctime)){
            result = middle;
            left = middle + 1;
        }
        else{
            right = middle - 1;
        }
        middle = (left + right) >> 1;
    }
    return result;
}



socket.on(`update`, (receiveData) =>{ // 새 메시지 도착!
    const id = receiveData.channel_id; // 채널 id 파악하고
    const unread = document.getElementById(`C${id}unread`); // 그 채널에서 읽지 않은 메시지 수를
    unread.textContent = parseInt(unread.textContent) + 1; // 1 늘림
    if(!("text-danger" in unread.classList))unread.className += ' text-danger font-weight-bold'; // 글자 색 변경하기
    const newbox = document.getElementById(`C${id}NEW`);
    if(!("alert" in newbox.classList)) newbox.className += ' alert alert-danger'; // 박스 색 변경하기
    newbox.textContent = "NEW!"; // 새 메시지 왔음을 알림
    const updatetime = document.getElementById(`C${id}time`); // 그 채널의 업데이트 시간을
    updatetime.textContent = receiveData.msg_time; // 갱신하고
    const target = document.getElementById(`C${id}`); // 그 채널 박스를
    target.remove(); // 지우고
    channelList.insertBefore(target, channelList.childNodes[0]); // 맨 위로 올려줌.
});


for(e of clist){ // 채널 리스트에서
    const unread = document.getElementById(`C${e.id}unread`);
    const num = parseInt(unread.textContent); // 읽지 않은 메시지 수를 불러다가
    if(num) unread.className += ' text-danger font-weight-bold'; // 0이 아니라면 색 강조 표시
}

socket.on(`invite`, (channelInfo) => { // 채널에 초대받은 경우
    const newChannel = document.createElement('div'); // 새 채널 정보를 넣기 위한 div 태그 element 생성
    // console.log(channelInfo);
    newChannel.id = `C${channelInfo.id}`; // id 속성 설정
    newChannel.className += ' row mb-3 col-12'; // className 설정. bootstrap을 위함
    newChannel.innerHTML = `<div class='list-group-item col-11 h-100'><a class='h1' href='/channels/${channelInfo.id}'>${channelInfo.name}</a>(읽지 않은 메시지: <span id='C${channelInfo.id}unread' class=' text-danger font-weight-bold'>${channelInfo.unread}</span>)<span class='alert alert-danger' id='C${channelInfo.id}NEW'>NEW!</span><div class='float-right'>최근 업데이트<br><span class='time-info' id='C${channelInfo.id}time'>${channelInfo.update_time}</span></div></div><form class='form-inline float-right col-1' method='POST' action='/channels/${channelInfo.id}?_method=PUT'><input type='hidden' name='_csrf' value=${csrfToken}><input class='btn btn-warning' type='submit' id='C${channelInfo.id}quit' onclick='return confirm("정말 나가시겠습니까?");' value='나감'></form>`
    // innerHTML 수정.
    const getPos = binary_search(channelInfo.update_time); // 시간을 통해 들어가야 할 위치 찾기
    // getPos: 자신보다 큰 시간을 가진 애들 중 가장 작은 애의 위치.
    // 따라서, getPos 바로 뒤에 들어가야 함.
    if(getPos != -1) channelList.insertBefore(newChannel, channelList.childNodes[getPos].nextSibling); // getPos번 노드 바로 뒤에 넣기
    else channelList.insertBefore(newChannel, channelList.childNodes[0]); // 예외: -1이면, 맨 앞에 넣기.
    const newbox = document.getElementById(`C${channelInfo.id}NEW`); // new box 만들기
    if(!("alert" in newbox.classList)) newbox.className += ' alert alert-danger';
    newbox.textContent = "NEW!";
    // 어차피 새 채널에 초대받으면 항상 NEW를 띄워야 한다.
    // unread > 0 ==> 당연히 NEW 띄움
    // unread == 0 ==> 새 채널임을 알리기 위해서 1로 설정되서 들어 옴.
    // unread < 0 ==> 존재하지 않음.
    socket.emit('join to', channelInfo); // 채널에 join 했음을 알리기 위한 소켓 통신.
});
