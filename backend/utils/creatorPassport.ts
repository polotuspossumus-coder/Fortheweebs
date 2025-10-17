type CreatorPassport = {
  id: string;
  wallet: string;
  name: string;
  region: string;
  language: string;
  tier: string;
  joinedAt: string;
  ritualsCompleted: string[];
};

const passports: CreatorPassport[] = [];

export function issuePassport(data: Omit<CreatorPassport, 'id' | 'joinedAt'>) {
  const passport: CreatorPassport = {
    ...data,
    id: `passport-${Date.now()}`,
    joinedAt: new Date().toISOString(),
    ritualsCompleted: [],
  };
  passports.push(passport);
  return passport;
}

export function getPassports() {
  return passports;
}
