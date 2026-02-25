import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { BookView, UserProfile, ExternalBlob } from '../backend';

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

export function useGetBookById(bookId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<BookView | null>({
    queryKey: ['book', bookId?.toString()],
    queryFn: async () => {
      if (!actor || bookId === null) return null;
      return actor.getBookById(bookId);
    },
    enabled: !!actor && !isFetching && bookId !== null,
  });
}

export function useGetBooksByGenre(genre: string | null) {
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

export function useGetBooksByAuthor(author: string | null) {
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

export function useGetBookmarks() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBookmarks();
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

export function useUploadBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      author,
      description,
      genres,
      cover,
      pdf,
    }: {
      title: string;
      author: string;
      description: string;
      genres: string[];
      cover: ExternalBlob | null;
      pdf: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.uploadBook(title, author, description, genres, cover, pdf);
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
    mutationFn: async ({
      bookId,
      title,
      author,
      description,
      genres,
      cover,
      pdf,
    }: {
      bookId: bigint;
      title: string;
      author: string;
      description: string;
      genres: string[];
      cover: ExternalBlob | null;
      pdf: ExternalBlob | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editBook(bookId, title, author, description, genres, cover, pdf);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myUploadedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['approvedBooks'] });
    },
  });
}

export function useDeleteBook() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_bookId: bigint) => {
      // Backend does not expose a deleteBook method yet.
      throw new Error('Delete book is not yet supported by the backend.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myUploadedBooks'] });
      queryClient.invalidateQueries({ queryKey: ['approvedBooks'] });
    },
  });
}

export function useGetReadingProgress(bookId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['readingProgress', bookId?.toString()],
    queryFn: async () => {
      if (!actor || bookId === null) return null;
      return actor.getReadingProgress(bookId);
    },
    enabled: !!actor && !isFetching && bookId !== null,
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
    onSuccess: (_, { bookId }) => {
      queryClient.invalidateQueries({ queryKey: ['readingProgress', bookId.toString()] });
    },
  });
}

export function useIncrementBookView() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (bookId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.incrementBookView(bookId);
    },
  });
}

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
    },
  });
}

export function useGetAdminStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      if (!actor) return null;
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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAssignCallerUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: any; role: any }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.assignCallerUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
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

// ─── Live Stat Card Queries ──────────────────────────────────────────────────

export function useGetTotalBooks() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalBooks'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalBooks();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useGetTotalActiveReaders() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalActiveReaders'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalActiveReaders();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useGetTotalAuthors() {
  const { actor, isFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['totalAuthors'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getTotalAuthors();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
