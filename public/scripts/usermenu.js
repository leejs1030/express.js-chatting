const user_info = document.getElementById('user-info');
const uesr_menu = document.getElementById('user-menu');

let cur = false;

document.getElementsByTagName('html')[0].addEventListener('click', (e)=>{
    if(e.target === user_info) return;
    uesr_menu.className = "collapse";
})
