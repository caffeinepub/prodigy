import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { type BookView, type UserProfile, type AdminStats, type ReadingProgress, type Bookmark, type User } from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (displayName: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerUser(displayName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(principal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<User | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      const { Principal } = await import('@dfinity/principal');
      return actor.getUserProfile(Principal.fromText(principal));
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

// ─── Books ───────────────────────────────────────────────────────────────────

export function useGetApprovedBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<BookView[]>({
    queryKey: ['approvedBooks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getApprovedBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBookById(bookId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<BookView | null>({
    queryKey: ['book', bookId?.toString()],
    queryFn: async () => {
      if (!actor || bookId === undefined) return null;
      return actor.getBookById(bookId);
    },
    enabled: !!actor && !isFetching && bookId !== undefined,
  });
}

export function useGetBooksByGenre(genre: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<BookView[]>({
    queryKey: ['booksByGenre', genre],
    queryFn: async () => {
      if (!actor || !genre) return [];
      return actor.getBooksByGenre(genre);
    },
    enabled: !!actor && !isFetching && !!genre,
  });
}

export function useGetBooksByAuthor(author: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<BookView[]>({
    queryKey: ['booksByAuthor', author],
    queryFn: async () => {
      if (!actor || !author) return [];
      return actor.getBooksByAuthor(author);
    },
    enabled: !!actor && !isFetching && !!author,
  });
}

export function useGetMyUploadedBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<BookView[]>({
    queryKey: ['myUploadedBooks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyUploadedBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUploadBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      author: string;
      description: string;
      genre: string;
      coverUrl: string;
      pdfUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadBook(
        params.title,
        params.author,
        params.description,
        params.genre,
        params.coverUrl,
        params.pdfUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myUploadedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['approvedBooks'] });
    },
  });
}

export function useEditBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      bookId: bigint;
      title: string;
      author: string;
      description: string;
      genre: string;
      coverUrl: string;
      pdfUrl: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editBook(
        params.bookId,
        params.title,
        params.author,
        params.description,
        params.genre,
        params.coverUrl,
        params.pdfUrl
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['myUploadedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['book', vars.bookId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['approvedBooks'] });
    },
  });
}

export function useIncrementBookView() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) return;
      try {
        await actor.incrementBookView(bookId);
      } catch {
        // Silently fail - view count is non-critical
      }
    },
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function useGetPendingBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<BookView[]>({
    queryKey: ['pendingBooks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.approveBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingBooks'] });
      queryClient.invalidateQueries({ queryKey: ['approvedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

export function useRejectBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.rejectBook(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingBooks'] });
      queryClient.invalidateQueries({ queryKey: ['approvedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });
}

export function useGetAdminStats() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminStats>({
    queryKey: ['adminStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAdminStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMostViewedBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<BookView[]>({
    queryKey: ['mostViewedBooks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMostViewedBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMostPopularBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<BookView[]>({
    queryKey: ['mostPopularBooks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMostPopularBooks();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Bookmarks ───────────────────────────────────────────────────────────────

export function useGetBookmarks() {
  const { actor, isFetching } = useActor();

  return useQuery<Bookmark[]>({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBookmarks();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBookmark(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

export function useRemoveBookmark() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.removeBookmark(bookId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}

// ─── Reading Progress ─────────────────────────────────────────────────────────

export function useGetReadingProgress(bookId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ReadingProgress | null>({
    queryKey: ['readingProgress', bookId?.toString()],
    queryFn: async () => {
      if (!actor || bookId === undefined) return null;
      try {
        return await actor.getReadingProgress(bookId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && bookId !== undefined,
  });
}

export function useSaveReadingProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, lastPage }: { bookId: bigint; lastPage: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveReadingProgress(bookId, lastPage);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress', vars.bookId.toString()] });
    },
  });
}
