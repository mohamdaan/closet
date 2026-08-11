create table users (
   id         serial primary key,
   name       varchar(100) not null,
   username   varchar(50) unique not null,
   email      varchar(255) unique not null,
   password   varchar(255) not null,
   created_at timestamp not null default now()
);

create table friendships (
   id           serial primary key,
   requester_id integer not null
      references users ( id )
         on delete cascade,
   receiver_id  integer not null
      references users ( id )
         on delete cascade,
   status       varchar(20) not null default 'pending' check ( status in ( 'pending',
                                                                     'accepted',
                                                                     'rejected' ) ),
   created_at   timestamp not null default now(),
   unique ( requester_id,
            receiver_id ),
   check ( requester_id != receiver_id )
);

create table items (
   id          serial primary key,
   user_id     integer not null
      references users ( id )
         on delete cascade,
   name        varchar(150) not null,
   brand       varchar(100),
   category    varchar(50),
   description text,
   image_url   text,
   product_url text,
   item_type   varchar(20) not null check ( item_type in ( 'WARDROBE',
                                                         'WISHLIST' ) ),
   created_at  timestamp not null default now()
);

create table posts (
   id         serial primary key,
   user_id    integer not null
      references users ( id )
         on delete cascade,
   item_id    integer not null
      references items ( id )
         on delete cascade,
   caption    text,
   created_at timestamp not null default now()
);

create table likes (
   id         serial primary key,
   user_id    integer not null
      references users ( id )
         on delete cascade,
   post_id    integer not null
      references posts ( id )
         on delete cascade,
   created_at timestamp not null default now(),
   unique ( user_id,
            post_id )
);

create table comments (
   id         serial primary key,
   user_id    integer not null
      references users ( id )
         on delete cascade,
   post_id    integer not null
      references posts ( id )
         on delete cascade,
   content    text not null,
   created_at timestamp not null default now()
);