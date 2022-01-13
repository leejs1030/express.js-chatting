const socket = io();

const createSocket = (id) => {
    socket.on(`update ${id}`, (receivedData) =>{
        const unread = document.getElementById(`C${id}unread`);
        unread.textContent = parseInt(unread.textContent) + 1;
        console.log(unread);
    });
};


for(e of clist){
    createSocket(e.id);
}