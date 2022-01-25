const socket = io();

for(e of friends){
    const targetId = e.id;
    const temp = document.getElementById(`invite${targetId}`);
    console.log(`invite${targetId}`);
    temp.addEventListener('click', (event) =>{
        event.preventDefault();
        console.log(targetId);
        socket.emit('invite', targetId);
        document.getElementById(targetId).remove();
    })
}