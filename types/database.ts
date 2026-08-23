export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Server = {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
};

export type ServerMember = {
  server_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
};

export type Channel = {
  id: string;
  server_id: string;
  name: string;
  type: "text" | "voice";
  created_at: string;
};

export type Message = {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  edited_at: string | null;
};

export type MessageWithAuthor = Message & {
  profiles: Pick<Profile, "id" | "username" | "display_name" | "avatar_url">;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
      servers: { Row: Server; Insert: Partial<Server> & { name: string; owner_id: string }; Update: Partial<Server> };
      server_members: { Row: ServerMember; Insert: ServerMember; Update: Partial<ServerMember> };
      channels: { Row: Channel; Insert: Partial<Channel> & { server_id: string; name: string }; Update: Partial<Channel> };
      messages: { Row: Message; Insert: Partial<Message> & { channel_id: string; user_id: string; content: string }; Update: Partial<Message> };
    };
  };
};
