import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface BookView {
    id: bigint;
    status: BookStatus;
    title: string;
    description: string;
    author: string;
    viewCount: bigint;
    genre: string;
    pdfUrl: string;
    coverUrl: string;
    editCount: bigint;
    uploadDate: Time;
    uploadedBy: Principal;
}
export interface Bookmark {
    user: Principal;
    bookId: bigint;
}
export interface User {
    principal: Principal;
    displayName: string;
    joinDate: Time;
}
export interface AdminStats {
    totalPendingBooks: bigint;
    totalUsers: bigint;
    totalBooks: bigint;
    totalApprovedBooks: bigint;
}
export interface ReadingProgress {
    user: Principal;
    bookId: bigint;
    lastPage: bigint;
    lastRead: Time;
}
export interface UserProfile {
    displayName: string;
    joinDate: Time;
}
export enum BookStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBookmark(bookId: bigint): Promise<void>;
    approveBook(bookId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    editBook(bookId: bigint, title: string, author: string, description: string, genre: string, coverUrl: string, pdfUrl: string): Promise<void>;
    getAdminStats(): Promise<AdminStats>;
    getApprovedBooks(): Promise<Array<BookView>>;
    getBookById(bookId: bigint): Promise<BookView | null>;
    getBookmarks(): Promise<Array<Bookmark>>;
    getBooksByAuthor(author: string): Promise<Array<BookView>>;
    getBooksByGenre(genre: string): Promise<Array<BookView>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMostPopularBooks(): Promise<Array<BookView>>;
    getMostViewedBooks(): Promise<Array<BookView>>;
    getMyUploadedBooks(): Promise<Array<BookView>>;
    getPendingBooks(): Promise<Array<BookView>>;
    getReadingProgress(bookId: bigint): Promise<ReadingProgress | null>;
    getUserProfile(user: Principal): Promise<User | null>;
    incrementBookView(bookId: bigint): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(displayName: string): Promise<void>;
    rejectBook(bookId: bigint): Promise<void>;
    removeBookmark(bookId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveReadingProgress(bookId: bigint, lastPage: bigint): Promise<void>;
    uploadBook(title: string, author: string, description: string, genre: string, coverUrl: string, pdfUrl: string): Promise<bigint>;
}
