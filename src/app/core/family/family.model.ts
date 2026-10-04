export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  role: string;
  joinedAt: string;
}

export interface Family {
  id: string;
  name: string;
  createdAt: string;
  members: FamilyMember[];
}

export interface Invite {
  code: string;
  expiresAt: string;
}
