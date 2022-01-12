const socket = io();

const createSocket = (id) => {
    console.log('hh');
    socket.on(`update ${id}`, (receivedData) =>{
        const unread = document.getElementById(`C${id}unread`);
        console.log(unread);
    });
};


for(e of clist){
    createSocket(e.id);
}