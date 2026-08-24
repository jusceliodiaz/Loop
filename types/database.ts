export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  role: "admin" | "member";
  approved: boolean;
  plan: "free" | "basic" | "pro";
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> };
    };
  };
};
