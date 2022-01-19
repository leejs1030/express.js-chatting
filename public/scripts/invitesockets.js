const socket = io();
const temp = document.getElementById(null);

for(e of friends){
    const temp = document.getElementById(`invite${e.id}`);
    console.log(`invite${e.id}`);
    temp.addEventListener('click', (event) =>{
        event.preventDefault();
        console.log('nonono');
        socket.emit('invite', e.id);
        document.getElementById(e.id).remove();
    })
}