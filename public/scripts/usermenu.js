// 우측 상단 로그인 닉네임을 클릭했을 때의 유저 메뉴가 뜨는 것과 관한 내용
const user_info = document.getElementById('user-info'); // 로그인 닉네임 부분
const uesr_menu = document.getElementById('user-menu'); // 눌렀을 때 뜨는 박스 부분

// let cur = false;

document.getElementsByTagName('html')[0].addEventListener('click', (e)=>{ // 타 영역 클릭 시 유저 메뉴 박스를 관리
    if(e.target === user_info || e.target === uesr_menu) return; // user_info 혹은 user_menu 부분이면 이 리스너는 무반응.
    // 다른 리스너 반응 등으로 인하여 변화가 생길 수는 있음.
    uesr_menu.className = "collapse"; // 그 외의 영역을 클릭하면, 강제로 닫아버리는 역할.
})
