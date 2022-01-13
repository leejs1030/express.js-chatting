let socket = io();

const createSocket = (id) => {
    socket.on(`update ${id}`, () =>{
        const unread = document.getElementById(`C${id}unread`);
        unread.textContent = parseInt(unread.textContent) + 1;
        if(!("text-danger" in unread.classList))unread.className += ' text-danger font-weight-bold';
        const newbox = document.getElementById(`C${id}`);
        newbox.className += ' alert alert-danger';
        newbox.textContent = "NEW!";
    });
};


for(e of clist){
    createSocket(e.id);
    const unread = document.getElementById(`C${e.id}unread`);
    const num = parseInt(unread.textContent);
    if(num) unread.className += ' text-danger font-weight-bold';
}

socket.on(`invite ${uid}`, () => {
    location.reload();
});