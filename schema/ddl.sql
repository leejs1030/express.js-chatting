drop table msg;
drop table channel_users;
drop table channels;
drop table reqlist, flist, blist;
drop table users;

create table users(
    id varchar(20),
    password varchar(200) not null,
    nick varchar(20) not null,
    primary key(id)
);

create table reqlist(
    sender varchar(20),
    receiver varchar(20),
    req_time timestamp,
    primary key(sender, receiver),
    foreign key (sender) references users(id),
    foreign key (receiver) references users(id)
);

create table flist(
    id1 varchar(20),
    id2 varchar(20),
    friend_date timestamp,
    primary key(id1, id2),
    foreign key (id1) references users(id),
    foreign key (id2) references users(id)
);

create table blist(
    adder varchar(20),
    added varchar(20),
    black_date timestamp,
    primary key(adder, added),
    foreign key (adder) references users(id),
    foreign key (added) references users(id)
);

create table channels(
    id SERIAL,
    name varchar(100) NOT NULL,
    creater varchar(20) NOT NULL,
    updatetime timestamp NOT NULL,
    primary key(id),
    foreign key(creater) references users(id) ON DELETE CASCADE
);

create table channel_users(
    channel_id integer NOT NULL,
    user_id varchar(20) NOT NULL,
    unread numeric(8, 0) NOT NULL,
    primary key(channel_id, user_id),
    foreign key (channel_id) references channels(id) ON DELETE CASCADE,
    foreign key (user_id) references users(id)
);

create table msg(
    sender varchar(20) not null,
    channel_id integer not null,
    msg_date timestamp NOT NULL,
    content varchar(20000) NOT NULL,
    foreign key (sender) references users(id),
    foreign key (channel_id) references channels(id) ON DELETE CASCADE
);

-- insert into users values('admin', 'admin', '관리자');
-- insert into users values('subadmin', 'subadmin', '부관리자');
-- insert into users values('u001', 'u001', '사용자001');

-- INSERT INTO flist values('admin', 'subadmin', now());
-- INSERT INTO flist values('admin', 'u001', now());

-- INSERT INTO channels values(DEFAULT, 'test channel 1', 'admin', now());
-- INSERT INTO channel_users values(1, 'admin', 0);