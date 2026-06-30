import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

// Types representing the database models
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  dob?: string | null;
  timezone: string;
  profilePic?: string | null;
  location?: string | null;
  language?: string | null;
  role: string;
  googleAccessToken?: string | null;
  googleRefreshToken?: string | null;
  googleTokenExpiry?: bigint | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  userName: string;
  action: string;
  details?: string | null;
  createdAt: string;
}

export interface Client {
  id: string;
  slNo?: number | null;
  date?: string | null;
  name: string;
  number?: string | null;
  whichService?: string | null;
  enquiry?: string | null;
  status: string;
  paid: boolean;
  workDetails?: string | null;
  amount?: string | null;
  websiteLinks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Work {
  id: string;
  title: string;
  clientName: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  details?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string | null;
  details?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  type: string;
  status: string;
  reminder?: string | null;
  location?: string | null;
  userId?: string | null;
  googleEventId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  myRole?: string | null;
  interviewDate?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content?: string | null;
  category: string;
  color: string;
  isPinned: boolean;
  tags?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface SocialAccount {
  id: string;
  platform: string;
  url?: string | null;
  username?: string | null;
  password?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SocialPost {
  id: string;
  title: string;
  content?: string | null;
  platform: string;
  status: string;
  scheduledFor?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Custom Password Hashing Utility
export function hashPassword(password: string): string {
  const salt = 'wingman_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// In-Memory map for password reset tokens (temporary)
const resetTokens = new Map<string, { email: string; expiresAt: number }>();

export function createResetToken(email: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  // Expires in 15 minutes
  resetTokens.set(token, { email, expiresAt: Date.now() + 15 * 60 * 1000 });
  return token;
}

export function consumeResetToken(token: string): string | null {
  const data = resetTokens.get(token);
  if (!data) return null;
  resetTokens.delete(token); // one-time use
  if (Date.now() > data.expiresAt) return null; // expired
  return data.email;
}

// In-Memory & File-based DB implementation for Local Fallback
class JsonDatabaseDriver {
  private filePath: string;
  private data: {
    users: User[];
    logs: ActivityLog[];
    clients: Client[];
    works: Work[];
    tasks: Task[];
    meetings: Meeting[];
    companies: Company[];
    notes: Note[];
    socialAccounts: SocialAccount[];
    socialPosts: SocialPost[];
    attachments: Attachment[];
  };

  constructor() {
    // Save database in root directory of project
    this.filePath = path.join(process.cwd(), 'wingman_db.json');
    this.data = {
      users: [],
      logs: [],
      clients: [],
      works: [],
      tasks: [],
      meetings: [],
      companies: [],
      notes: [],
      socialAccounts: [],
      socialPosts: [],
      attachments: [],
    };
    this.load();
    this.seedAdmin();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
        if (!this.data.socialAccounts) this.data.socialAccounts = [];
        if (!this.data.socialPosts) this.data.socialPosts = [];
        if (!this.data.attachments) this.data.attachments = [];
      } else {
        this.save();
      }
    } catch (error) {
      console.error('Failed to load JSON database, resetting. Error:', error);
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save JSON database:', error);
    }
  }

  private seedAdmin() {
    const adminEmail = 'marketingwithafsal@gmail.com';
    const adminExists = this.data.users.some(u => u.email === adminEmail);
    if (!adminExists) {
      const adminUser: User = {
        id: 'admin-default-uuid',
        email: adminEmail,
        passwordHash: hashPassword('Afsal@1323wingman'),
        name: 'Afsey',
        phone: '+91 8078873963',
        dob: '1995-01-01', // Placeholder or customizable
        timezone: 'Asia/Kolkata',
        profilePic: null,
        role: 'admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.data.users.push(adminUser);
      this.save();
      console.log('Seeded Admin account (Afsey) into JSON Database.');
    }
  }

  // --- API FOR USERS ---
  async getUserByEmail(email: string): Promise<User | null> {
    this.load();
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    this.load();
    return this.data.users.find(u => u.phone === phone) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    this.load();
    return this.data.users.find(u => u.id === id) || null;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    this.load();
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'email' | 'phone' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    this.load();
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    const updatedUser = {
      ...this.data.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.users[index] = updatedUser;
    this.save();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    this.load();
    return [...this.data.users];
  }

  async deleteUser(id: string): Promise<boolean> {
    this.load();
    const initialLength = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.save();
    return this.data.users.length < initialLength;
  }

  // --- API FOR ACTIVITY LOGS ---
  async addActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
    this.load();
    const newLog: ActivityLog = {
      ...log,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.data.logs.push(newLog);
    this.save();
    return newLog;
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    this.load();
    return [...this.data.logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  // --- API FOR CLIENTS ---
  async getClients(): Promise<Client[]> {
    this.load();
    return [...this.data.clients];
  }

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    this.load();
    const newClient: Client = {
      slNo: client.slNo ?? null,
      date: client.date ?? null,
      name: client.name,
      number: client.number ?? null,
      whichService: client.whichService ?? null,
      enquiry: client.enquiry ?? null,
      status: client.status || 'Contacted',
      paid: client.paid ?? false,
      workDetails: client.workDetails ?? null,
      amount: client.amount ?? null,
      websiteLinks: client.websiteLinks ?? null,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.clients.push(newClient);
    this.save();
    return newClient;
  }

  async updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Client> {
    this.load();
    const index = this.data.clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');
    const updated = {
      ...this.data.clients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.clients[index] = updated;
    this.save();
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    this.load();
    const initialLength = this.data.clients.length;
    this.data.clients = this.data.clients.filter(c => c.id !== id);
    this.save();
    return this.data.clients.length < initialLength;
  }

  // --- API FOR WORKS ---
  async getWorks(): Promise<Work[]> {
    this.load();
    return [...this.data.works];
  }

  async createWork(work: Omit<Work, 'id' | 'createdAt' | 'updatedAt'>): Promise<Work> {
    this.load();
    const newWork: Work = {
      ...work,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.works.push(newWork);
    this.save();
    return newWork;
  }

  async updateWork(id: string, updates: Partial<Omit<Work, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Work> {
    this.load();
    const index = this.data.works.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Work item not found');
    const updated = {
      ...this.data.works[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.works[index] = updated;
    this.save();
    return updated;
  }

  async deleteWork(id: string): Promise<boolean> {
    this.load();
    const initialLength = this.data.works.length;
    this.data.works = this.data.works.filter(w => w.id !== id);
    this.save();
    return this.data.works.length < initialLength;
  }

  // --- API FOR TASKS ---
  async getTasks(): Promise<Task[]> {
    this.load();
    return [...this.data.tasks];
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    this.load();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.tasks.push(newTask);
    this.save();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> {
    this.load();
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Task not found');
    const updated = {
      ...this.data.tasks[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.tasks[index] = updated;
    this.save();
    return updated;
  }

  async deleteTask(id: string): Promise<boolean> {
    this.load();
    const initialLength = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.save();
    return this.data.tasks.length < initialLength;
  }

  // --- API FOR MEETINGS ---
  async getMeetings(): Promise<Meeting[]> {
    this.load();
    return [...this.data.meetings];
  }

  async createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    this.load();
    const newMeeting: Meeting = {
      ...meeting,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.meetings.push(newMeeting);
    this.save();
    return newMeeting;
  }

  async updateMeeting(id: string, updates: Partial<Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Meeting> {
    this.load();
    const index = this.data.meetings.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Meeting not found');
    const updated = {
      ...this.data.meetings[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.meetings[index] = updated;
    this.save();
    return updated;
  }

  async deleteMeeting(id: string): Promise<boolean> {
    this.load();
    const initialLength = this.data.meetings.length;
    this.data.meetings = this.data.meetings.filter(m => m.id !== id);
    this.save();
    return this.data.meetings.length < initialLength;
  }

  // --- API FOR COMPANIES ---
  async getCompanies(): Promise<Company[]> {
    this.load();
    return [...this.data.companies];
  }

  async createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    this.load();
    const newCompany: Company = {
      ...company,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.companies.push(newCompany);
    this.save();
    return newCompany;
  }

  async updateCompany(id: string, updates: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Company> {
    this.load();
    const index = this.data.companies.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Company not found');
    const updated = {
      ...this.data.companies[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.companies[index] = updated;
    this.save();
    return updated;
  }

  async deleteCompany(id: string): Promise<boolean> {
    this.load();
    const initialLength = this.data.companies.length;
    this.data.companies = this.data.companies.filter(c => c.id !== id);
    this.save();
    return this.data.companies.length < initialLength;
  }

  // --- API FOR NOTES ---
  async getNotes(category?: string | null): Promise<Note[]> {
    this.load();
    const notes = [...this.data.notes];
    if (category) {
      return notes.filter(n => n.category === category).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
    }
    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    this.load();
    if (!this.data.notes) this.data.notes = [];
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.notes.push(newNote);
    this.save();
    return newNote;
  }

  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Note> {
    this.load();
    if (!this.data.notes) this.data.notes = [];
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Note not found');
    const updated = {
      ...this.data.notes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.notes[index] = updated;
    this.save();
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    this.load();
    if (!this.data.notes) return false;
    const len = this.data.notes.length;
    this.data.notes = this.data.notes.filter(n => n.id !== id);
    if (this.data.notes.length < len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- API FOR SOCIAL ACCOUNTS ---
  async getSocialAccounts(): Promise<SocialAccount[]> {
    this.load();
    return [...this.data.socialAccounts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSocialAccount(account: Omit<SocialAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<SocialAccount> {
    this.load();
    const newAccount: SocialAccount = {
      ...account,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.socialAccounts.push(newAccount);
    this.save();
    return newAccount;
  }

  async updateSocialAccount(id: string, updates: Partial<Omit<SocialAccount, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SocialAccount> {
    this.load();
    const index = this.data.socialAccounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Account not found');
    const updated = {
      ...this.data.socialAccounts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.socialAccounts[index] = updated;
    this.save();
    return updated;
  }

  async deleteSocialAccount(id: string): Promise<boolean> {
    this.load();
    const len = this.data.socialAccounts.length;
    this.data.socialAccounts = this.data.socialAccounts.filter(a => a.id !== id);
    if (this.data.socialAccounts.length < len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- API FOR SOCIAL POSTS ---
  async getSocialPosts(): Promise<SocialPost[]> {
    this.load();
    return [...this.data.socialPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSocialPost(post: Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<SocialPost> {
    this.load();
    const newPost: SocialPost = {
      ...post,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.socialPosts.push(newPost);
    this.save();
    return newPost;
  }

  async updateSocialPost(id: string, updates: Partial<Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SocialPost> {
    this.load();
    const index = this.data.socialPosts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Post not found');
    const updated = {
      ...this.data.socialPosts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.data.socialPosts[index] = updated;
    this.save();
    return updated;
  }

  async deleteSocialPost(id: string): Promise<boolean> {
    this.load();
    const len = this.data.socialPosts.length;
    this.data.socialPosts = this.data.socialPosts.filter(p => p.id !== id);
    if (this.data.socialPosts.length < len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- API FOR ATTACHMENTS ---
  async getAttachments(): Promise<Attachment[]> {
    this.load();
    if (!this.data.attachments) return [];
    return [...this.data.attachments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createAttachment(attachment: Omit<Attachment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Attachment> {
    this.load();
    if (!this.data.attachments) this.data.attachments = [];
    const newAttachment: Attachment = {
      ...attachment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.attachments.push(newAttachment);
    this.save();
    return newAttachment;
  }

  async deleteAttachment(id: string): Promise<boolean> {
    this.load();
    if (!this.data.attachments) return false;
    const len = this.data.attachments.length;
    this.data.attachments = this.data.attachments.filter(a => a.id !== id);
    if (this.data.attachments.length < len) {
      this.save();
      return true;
    }
    return false;
  }
}

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Singleton Prisma client for PostgreSQL
let _prismaInstance: PrismaClient | null = null;

function getPrismaClient(): PrismaClient {
  if (!_prismaInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set. Cannot create Prisma client.');
    }
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    _prismaInstance = new PrismaClient({ adapter });
  }
  return _prismaInstance;
}

// PostgreSQL Prisma Driver implementation
class PrismaDatabaseDriver {
  private _prisma: PrismaClient | null = null;

  constructor() {
    // Don't initialize eagerly — wait for first use so build time doesn't crash
    this.seedAdmin();
  }

  get prismaClient() {
    if (!this._prisma) {
      this._prisma = getPrismaClient();
    }
    return this._prisma;
  }

  private get prisma() {
    return this.prismaClient;
  }

  private async seedAdmin() {
    try {
      const adminEmail = 'marketingwithafsal@gmail.com';
      const existing = await this.prisma.user.findUnique({
        where: { email: adminEmail }
      });
      if (!existing) {
        await this.prisma.user.create({
          data: {
            email: adminEmail,
            password: hashPassword('Afsal@1323wingman'),
            name: 'Afsey',
            phone: '+91 8078873963',
            dob: new Date('1995-01-01'),
            timezone: 'Asia/Kolkata',
            role: 'admin',
          }
        });
        console.log('Seeded Admin account (Afsey) into PostgreSQL Database via Prisma.');
      }
    } catch (e) {
      console.warn('Prisma seed admin failed. (Database might not be running yet).');
    }
  }

  private mapUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      passwordHash: dbUser.password,
      name: dbUser.name,
      phone: dbUser.phone,
      dob: dbUser.dob ? dbUser.dob.toISOString().split('T')[0] : null,
      timezone: dbUser.timezone,
      profilePic: dbUser.profilePic,
      role: dbUser.role,
      googleAccessToken: dbUser.googleAccessToken,
      googleRefreshToken: dbUser.googleRefreshToken,
      googleTokenExpiry: dbUser.googleTokenExpiry,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { email } });
    return u ? this.mapUser(u) : null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { phone } });
    return u ? this.mapUser(u) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    return u ? this.mapUser(u) : null;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const u = await this.prisma.user.create({
      data: {
        email: user.email,
        password: user.passwordHash,
        name: user.name,
        phone: user.phone,
        dob: user.dob ? new Date(user.dob) : null,
        timezone: user.timezone,
        profilePic: user.profilePic,
        role: user.role,
      }
    });
    return this.mapUser(u);
  }

  async updateUser(id: string, updates: Partial<Omit<User, 'id' | 'email' | 'phone' | 'createdAt' | 'updatedAt'>>): Promise<User> {
    const data: any = {};
    if (updates.passwordHash !== undefined) data.password = updates.passwordHash;
    if (updates.name !== undefined) data.name = updates.name;
    if (updates.dob !== undefined) data.dob = updates.dob ? new Date(updates.dob) : null;
    if (updates.timezone !== undefined) data.timezone = updates.timezone;
    if (updates.profilePic !== undefined) data.profilePic = updates.profilePic;
    if (updates.role !== undefined) data.role = updates.role;
    if ((updates as any).googleAccessToken !== undefined) data.googleAccessToken = (updates as any).googleAccessToken;
    if ((updates as any).googleRefreshToken !== undefined) data.googleRefreshToken = (updates as any).googleRefreshToken;
    if ((updates as any).googleTokenExpiry !== undefined) data.googleTokenExpiry = (updates as any).googleTokenExpiry;

    const u = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.mapUser(u);
  }

  async getAllUsers(): Promise<User[]> {
    const list = await this.prisma.user.findMany();
    return list.map(this.mapUser);
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.prisma.user.delete({ where: { id } });
    return true;
  }

  async addActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> {
    const item = await this.prisma.activityLog.create({
      data: {
        userId: log.userId,
        userName: log.userName,
        action: log.action,
        details: log.details,
      }
    });
    return {
      id: item.id,
      userId: item.userId,
      userName: item.userName,
      action: item.action,
      details: item.details,
      createdAt: item.createdAt.toISOString(),
    };
  }

  async getActivityLogs(): Promise<ActivityLog[]> {
    const list = await this.prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map(item => ({
      id: item.id,
      userId: item.userId,
      userName: item.userName,
      action: item.action,
      details: item.details,
      createdAt: item.createdAt.toISOString(),
    }));
  }

  private mapClient(item: any): Client {
    return {
      id: item.id,
      slNo: item.slNo ?? null,
      date: item.date ? (item.date instanceof Date ? item.date.toISOString().split('T')[0] : item.date) : null,
      name: item.name,
      number: item.number ?? null,
      whichService: item.whichService ?? null,
      enquiry: item.enquiry ?? null,
      status: item.status,
      paid: item.paid ?? false,
      workDetails: item.workDetails ?? null,
      amount: item.amount ?? null,
      websiteLinks: item.websiteLinks ?? null,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : item.updatedAt,
    };
  }

  async getClients(): Promise<Client[]> {
    const list = await this.prisma.client.findMany();
    return list.map(item => this.mapClient(item));
  }

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    const item = await this.prisma.client.create({
      data: {
        slNo: client.slNo ?? null,
        date: client.date ? new Date(client.date) : null,
        name: client.name,
        number: client.number ?? null,
        whichService: client.whichService ?? null,
        enquiry: client.enquiry ?? null,
        status: client.status || 'Contacted',
        paid: client.paid ?? false,
        workDetails: client.workDetails ?? null,
        amount: client.amount ?? null,
        websiteLinks: client.websiteLinks ?? null,
      }
    });
    return this.mapClient(item);
  }

  async updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Client> {
    const data: any = { ...updates };
    if (updates.date !== undefined) {
      data.date = updates.date ? new Date(updates.date) : null;
    }
    const item = await this.prisma.client.update({
      where: { id },
      data,
    });
    return this.mapClient(item);
  }

  async deleteClient(id: string): Promise<boolean> {
    await this.prisma.client.delete({ where: { id } });
    return true;
  }

  async getWorks(): Promise<Work[]> {
    const list = await this.prisma.work.findMany();
    return list.map(item => ({
      ...item,
      dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createWork(work: Omit<Work, 'id' | 'createdAt' | 'updatedAt'>): Promise<Work> {
    const item = await this.prisma.work.create({
      data: {
        title: work.title,
        clientName: work.clientName,
        status: work.status,
        priority: work.priority,
        dueDate: work.dueDate ? new Date(work.dueDate) : null,
        details: work.details,
      }
    });
    return {
      ...item,
      dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async updateWork(id: string, updates: Partial<Omit<Work, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Work> {
    const data = { ...updates } as any;
    if (updates.dueDate !== undefined) {
      data.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }
    const item = await this.prisma.work.update({
      where: { id },
      data,
    });
    return {
      ...item,
      dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async deleteWork(id: string): Promise<boolean> {
    await this.prisma.work.delete({ where: { id } });
    return true;
  }

  async getTasks(): Promise<Task[]> {
    const list = await this.prisma.task.findMany();
    return list.map(item => ({
      ...item,
      dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    const item = await this.prisma.task.create({
      data: {
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        details: task.details,
        userId: task.userId,
      }
    });
    return {
      ...item,
      dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> {
    const data = { ...updates } as any;
    if (updates.dueDate !== undefined) {
      data.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }
    const item = await this.prisma.task.update({
      where: { id },
      data,
    });
    return {
      ...item,
      dueDate: item.dueDate ? item.dueDate.toISOString().split('T')[0] : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async deleteTask(id: string): Promise<boolean> {
    await this.prisma.task.delete({ where: { id } });
    return true;
  }

  async getMeetings(): Promise<Meeting[]> {
    const list = await this.prisma.meeting.findMany();
    return list.map(item => ({
      ...item,
      startTime: item.startTime.toISOString(),
      endTime: item.endTime.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createMeeting(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>): Promise<Meeting> {
    const item = await this.prisma.meeting.create({
      data: {
        title: meeting.title,
        description: meeting.description,
        startTime: new Date(meeting.startTime),
        endTime: new Date(meeting.endTime),
        type: meeting.type,
        status: meeting.status,
        userId: meeting.userId,
        location: meeting.location,
        reminder: meeting.reminder,
        googleEventId: meeting.googleEventId,
      }
    });
    return {
      ...item,
      startTime: item.startTime.toISOString(),
      endTime: item.endTime.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async updateMeeting(id: string, updates: Partial<Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Meeting> {
    const data = { ...updates } as any;
    if (updates.startTime !== undefined) data.startTime = new Date(updates.startTime);
    if (updates.endTime !== undefined) data.endTime = new Date(updates.endTime);
    if (updates.googleEventId !== undefined) data.googleEventId = updates.googleEventId;

    const item = await this.prisma.meeting.update({
      where: { id },
      data,
    });
    return {
      ...item,
      startTime: item.startTime.toISOString(),
      endTime: item.endTime.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async deleteMeeting(id: string): Promise<boolean> {
    await this.prisma.meeting.delete({ where: { id } });
    return true;
  }

  async getCompanies(): Promise<Company[]> {
    const list = await this.prisma.company.findMany();
    return list.map(item => ({
      ...item,
      interviewDate: item.interviewDate ? item.interviewDate.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const item = await this.prisma.company.create({
      data: {
        name: company.name,
        industry: company.industry,
        myRole: company.myRole,
        interviewDate: company.interviewDate ? new Date(company.interviewDate) : null,
        status: company.status || 'Collab',
        notes: company.notes,
      } as any
    });
    return {
      ...item,
      interviewDate: (item as any).interviewDate ? (item as any).interviewDate.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    } as Company;
  }

  async updateCompany(id: string, updates: Partial<Omit<Company, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Company> {
    const item = await this.prisma.company.update({
      where: { id },
      data: updates as any,
    });
    return {
      ...item,
      interviewDate: (item as any).interviewDate ? (item as any).interviewDate.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    } as Company;
  }

  async deleteCompany(id: string): Promise<boolean> {
    await this.prisma.company.delete({ where: { id } });
    return true;
  }

  async getNotes(category?: string | null): Promise<Note[]> {
    const where = category ? { category } : {};
    const list = await this.prisma.note.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return list.map(item => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    const item = await this.prisma.note.create({
      data: {
        title: note.title,
        content: note.content,
        category: note.category,
        color: note.color || '#1e1e2e',
        isPinned: note.isPinned || false,
        tags: note.tags,
        userId: note.userId,
      },
    });
    return {
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Note> {
    const item = await this.prisma.note.update({
      where: { id },
      data: updates as any,
    });
    return {
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async deleteNote(id: string): Promise<boolean> {
    await this.prisma.note.delete({ where: { id } });
    return true;
  }

  // --- API FOR SOCIAL ACCOUNTS ---
  async getSocialAccounts(): Promise<SocialAccount[]> {
    const list = await this.prisma.socialAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map((item: any) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createSocialAccount(account: Omit<SocialAccount, 'id' | 'createdAt' | 'updatedAt'>): Promise<SocialAccount> {
    const item = await this.prisma.socialAccount.create({
      data: account as any,
    });
    return {
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    } as SocialAccount;
  }

  async updateSocialAccount(id: string, updates: Partial<Omit<SocialAccount, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SocialAccount> {
    const item = await this.prisma.socialAccount.update({
      where: { id },
      data: updates as any,
    });
    return {
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    } as SocialAccount;
  }

  async deleteSocialAccount(id: string): Promise<boolean> {
    await this.prisma.socialAccount.delete({ where: { id } });
    return true;
  }

  // --- API FOR SOCIAL POSTS ---
  async getSocialPosts(): Promise<SocialPost[]> {
    const list = await this.prisma.socialPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map((item: any) => ({
      ...item,
      scheduledFor: item.scheduledFor ? item.scheduledFor.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createSocialPost(post: Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<SocialPost> {
    const item = await this.prisma.socialPost.create({
      data: {
        ...post,
        scheduledFor: post.scheduledFor ? new Date(post.scheduledFor) : null,
      } as any,
    });
    return {
      ...item,
      scheduledFor: (item as any).scheduledFor ? (item as any).scheduledFor.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    } as SocialPost;
  }

  async updateSocialPost(id: string, updates: Partial<Omit<SocialPost, 'id' | 'createdAt' | 'updatedAt'>>): Promise<SocialPost> {
    const item = await this.prisma.socialPost.update({
      where: { id },
      data: {
        ...updates,
        ...(updates.scheduledFor !== undefined ? { scheduledFor: updates.scheduledFor ? new Date(updates.scheduledFor) : null } : {}),
      } as any,
    });
    return {
      ...item,
      scheduledFor: (item as any).scheduledFor ? (item as any).scheduledFor.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    } as SocialPost;
  }

  async deleteSocialPost(id: string): Promise<boolean> {
    await this.prisma.socialPost.delete({ where: { id } });
    return true;
  }

  // --- API FOR ATTACHMENTS ---
  async getAttachments(): Promise<Attachment[]> {
    const list = await (this.prisma as any).attachment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return list.map((item: any) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));
  }

  async createAttachment(attachment: Omit<Attachment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Attachment> {
    const item = await (this.prisma as any).attachment.create({
      data: attachment,
    });
    return {
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async deleteAttachment(id: string): Promise<boolean> {
    await (this.prisma as any).attachment.delete({ where: { id } });
    return true;
  }
}

// Instantiate and export database driver based on environment / connectivity
const databaseUrl = process.env.DATABASE_URL || '';
const isPostgresConfigured = databaseUrl.trim().length > 0 && !databaseUrl.includes('localhost:51213'); // ignore default prisma localdev template

let db: JsonDatabaseDriver | PrismaDatabaseDriver;

if (isPostgresConfigured) {
  console.log('PostgreSQL database url configured. Attempting to use Prisma client...');
  db = new PrismaDatabaseDriver();
} else {
  console.log('PostgreSQL database url not configured. Falling back to local JSON database.');
  db = new JsonDatabaseDriver();
}

export { db };
