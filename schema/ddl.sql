drop table msg, "session";
drop table channel_users;
drop table channels;
drop table reqlist, flist, blist, user_settings;
drop table users;
-- 혹시 테이블이 이미 있었다면 미리 초기화 하기

create table users( -- 유저 테이블
    id varchar(20), -- id
    password varchar(200) not null, -- 암호화 pw
    nick varchar(20) not null, -- 닉네임
    primary key(id) -- primary key는 id
);

create table user_settings( -- 유저의 설정 값을 저장하는 테이블
    id varchar(20),
    send_enter boolean NOT NULL DEFAULT TRUE, -- 엔터로 전송 여부 설정
    primary key(id),
    foreign key (id) references users(id) ON DELETE CASCADE
);

create table reqlist( -- 요청 리스트
    sender varchar(20), -- 보낸 이
    receiver varchar(20), -- 받은 이
    req_time timestamp, -- 전송 시간
    primary key(sender, receiver),
    foreign key (sender) references users(id) ON DELETE CASCADE,
    foreign key (receiver) references users(id) ON DELETE CASCADE
);

create table flist( -- 친구 리스트
    id1 varchar(20),
    id2 varchar(20),
    -- id1과 id2는 친구. 순서는 무관하게 취급해야함. 순서 무관성에 대한 것은 DAO에서 생각함.
    friend_date timestamp, -- 맺은 날짜
    primary key(id1, id2),
    foreign key (id1) references users(id) ON DELETE CASCADE,
    foreign key (id2) references users(id) ON DELETE CASCADE
);

create table blist(
    adder varchar(20), -- 추가한 사람
    added varchar(20), -- 추가당한 사람
    -- adder가 added를 블랙함.
    -- added는 자신이 블랙 당했는지 확인할 수 없어야
    black_date timestamp,
    primary key(adder, added),
    foreign key (adder) references users(id) ON DELETE CASCADE,
    foreign key (added) references users(id) ON DELETE CASCADE
);

create table channels(
    id SERIAL, -- 채널 id를 serial로 사용.
    name varchar(100) NOT NULL, -- 이름
    creater varchar(20) NOT NULL, -- 생성자? 창조자? 만든 사람?
    updatetime timestamp NOT NULL, -- 업데이트 시간. 자주 바뀔 것.
    primary key(id),
    foreign key(creater) references users(id) ON DELETE CASCADE
);

create table channel_users( -- 채널에 속한 유저를 관리
    channel_id integer NOT NULL, -- 채널 id
    user_id varchar(20) NOT NULL, -- 유저 id
    unread int NOT NULL, -- 해당 유저가 읽지 않은 메시지 수
    primary key(channel_id, user_id),
    foreign key (channel_id) references channels(id) ON DELETE CASCADE,
    foreign key (user_id) references users(id) ON DELETE CASCADE
);

create table msg(
    sender varchar(20) not null, -- 보낸 이
    channel_id integer not null, -- 채널 id
    msg_date timestamp NOT NULL, -- 메시지 날짜
    content varchar(20000) NOT NULL, -- 메시지 내용
    -- 메시지의 primary key는 일단 없음. 위의 모든 내용을 중복시키는 것이 아마도 완전히 불가능하진 않을 것?
    -- 만약 필요하다면 channel_id에서 했듯이 SERIAL를 사용해야할 것.
    foreign key (sender) references users(id) ON DELETE SET NULL,
    foreign key (channel_id) references channels(id) ON DELETE CASCADE
);

-- 아래는 세션과 관련된 테이블
-- node_modules/connect-pg-simple/table.sql을 참조
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");

insert into users values('admin', 'admin', '관리자');
insert into users values('subadmin', 'subadmin', '부관리자');
-- insert into users values('u001', 'u001', '사용자001');

INSERT INTO flist values('admin', 'subadmin', now());
INSERT INTO flist values('admin', 'u001', now());

-- INSERT INTO channels values(DEFAULT, 'test channel 1', 'admin', now());
-- INSERT INTO channel_users values(1, 'admin', 0);

-- IF YOU ALREADY USING DB
ALTER TABLE msg RENAME COLUMN msg_date TO msg_time;
ALTER TABLE blist RENAME COLUMN black_date TO black_time;
ALTER TABLE flist RENAME COLUMN friend_date TO friend_time;
ALTER TABLE channels RENAME COLUMN updatetime TO update_time;