import Time "mo:core/Time";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type Book = {
    id : Nat;
    title : Text;
    author : Text;
    description : Text;
    genre : Text;
    coverUrl : Text;
    pdfUrl : Text;
    uploadedBy : Principal;
    uploadDate : Time.Time;
    var status : BookStatus;
    var editCount : Nat;
    var viewCount : Nat;
  };

  module Book {
    public func compare(a : Book, b : Book) : Order.Order {
      switch (Text.compare(a.title, b.title)) {
        case (#equal) { Text.compare(a.author, b.author) };
        case (order) { order };
      };
    };
  };

  type BookView = {
    id : Nat;
    title : Text;
    author : Text;
    description : Text;
    genre : Text;
    coverUrl : Text;
    pdfUrl : Text;
    uploadedBy : Principal;
    uploadDate : Time.Time;
    status : BookStatus;
    editCount : Nat;
    viewCount : Nat;
  };

  module BookView {
    public func fromBook(book : Book) : BookView {
      {
        id = book.id;
        title = book.title;
        author = book.author;
        description = book.description;
        genre = book.genre;
        coverUrl = book.coverUrl;
        pdfUrl = book.pdfUrl;
        uploadedBy = book.uploadedBy;
        uploadDate = book.uploadDate;
        status = book.status;
        editCount = book.editCount;
        viewCount = book.viewCount;
      };
    };
  };

  type BookStatus = { #pending; #approved; #rejected };
  type ReadingProgress = {
    user : Principal;
    bookId : Nat;
    lastPage : Nat;
    lastRead : Time.Time;
  };

  type Bookmark = {
    user : Principal;
    bookId : Nat;
  };

  type User = {
    principal : Principal;
    displayName : Text;
    joinDate : Time.Time;
  };

  type UserProfile = {
    displayName : Text;
    joinDate : Time.Time;
  };

  module User {
    public func compare(a : User, b : User) : Order.Order {
      Text.compare(a.displayName, b.displayName);
    };
  };

  type AdminStats = {
    totalUsers : Nat;
    totalBooks : Nat;
    totalApprovedBooks : Nat;
    totalPendingBooks : Nat;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let books = Map.empty<Nat, Book>();
  let users = Map.empty<Principal, User>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let readingProgress = Map.empty<Principal, Map.Map<Nat, ReadingProgress>>();
  let bookmarks = Map.empty<Principal, List.List<Bookmark>>();
  var nextBookId = 1;

  // ─── User Profile (required by frontend) ───────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?User {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    users.get(user);
  };

  // ─── User Registration ──────────────────────────────────────────────────────

  public shared ({ caller }) func registerUser(displayName : Text) : async () {
    // Any caller (including guests) can register — no auth check needed
    let user : User = {
      principal = caller;
      displayName;
      joinDate = Time.now();
    };
    users.add(caller, user);

    // Also save a UserProfile for frontend compatibility
    let profile : UserProfile = {
      displayName;
      joinDate = Time.now();
    };
    userProfiles.add(caller, profile);
  };

  // ─── Book Management ────────────────────────────────────────────────────────

  public shared ({ caller }) func uploadBook(
    title : Text,
    author : Text,
    description : Text,
    genre : Text,
    coverUrl : Text, // Accepts base64 data URL or external
    pdfUrl : Text, // Accepts base64 data URL or external
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can upload books");
    };

    let bookId = nextBookId;
    nextBookId += 1;

    let book : Book = {
      id = bookId;
      title;
      author;
      description;
      genre;
      coverUrl;
      pdfUrl;
      uploadedBy = caller;
      uploadDate = Time.now();
      var status = #pending;
      var editCount = 3;
      var viewCount = 0;
    };

    books.add(bookId, book);
    bookId;
  };

  public shared ({ caller }) func editBook(
    bookId : Nat,
    title : Text,
    author : Text,
    description : Text,
    genre : Text,
    coverUrl : Text,
    pdfUrl : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can edit books");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) {
        if (book.uploadedBy != caller) {
          Runtime.trap("Unauthorized: Only the original uploader can edit this book");
        };
        if (book.editCount == 0) {
          Runtime.trap("Book has reached the maximum number of edits");
        };

        book.editCount -= 1;
        let updatedBook : Book = {
          book with
          title;
          author;
          description;
          genre;
          coverUrl;
          pdfUrl;
          var status = #pending;
          var editCount = book.editCount;
          var viewCount = book.viewCount;
        };
        books.add(bookId, updatedBook);
      };
    };
  };

  public shared ({ caller }) func approveBook(bookId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve books");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book.status := #approved };
    };
  };

  public shared ({ caller }) func rejectBook(bookId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject books");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book.status := #rejected };
    };
  };

  public query ({ caller }) func getApprovedBooks() : async [BookView] {
    if (false) { Runtime.trap("unused auth check") };
    books.values().toArray().filter(func(book : Book) : Bool { book.status == #approved }).map(func(b) { BookView.fromBook(b) });
  };

  public query ({ caller }) func getPendingBooks() : async [BookView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view pending books");
    };
    books.values().toArray().filter(func(book : Book) : Bool { book.status == #pending }).map(func(b) { BookView.fromBook(b) });
  };

  public query ({ caller }) func getBookById(bookId : Nat) : async ?BookView {
    if (false) { Runtime.trap("unused auth check") };
    switch (books.get(bookId)) {
      case (null) { null };
      case (?book) { ?BookView.fromBook(book) };
    };
  };

  public query ({ caller }) func getBooksByGenre(genre : Text) : async [BookView] {
    if (false) { Runtime.trap("unused auth check") };
    books.values().toArray().filter(func(book : Book) : Bool {
      Text.equal(book.genre, genre) and book.status == #approved
    }).map(func(b) { BookView.fromBook(b) });
  };

  public query ({ caller }) func getBooksByAuthor(author : Text) : async [BookView] {
    if (false) { Runtime.trap("unused auth check") };
    books.values().toArray().filter(func(book : Book) : Bool {
      Text.equal(book.author, author) and book.status == #approved
    }).map(func(b) { BookView.fromBook(b) });
  };

  // ─── Reading Progress ───────────────────────────────────────────────────────

  public shared ({ caller }) func saveReadingProgress(bookId : Nat, lastPage : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can save reading progress");
    };

    let progress : ReadingProgress = {
      user = caller;
      bookId;
      lastPage;
      lastRead = Time.now();
    };

    let userProgress = switch (readingProgress.get(caller)) {
      case (?map) { map };
      case (null) { Map.empty<Nat, ReadingProgress>() };
    };

    userProgress.add(bookId, progress);
    readingProgress.add(caller, userProgress);
  };

  public query ({ caller }) func getReadingProgress(bookId : Nat) : async ?ReadingProgress {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view reading progress");
    };

    switch (readingProgress.get(caller)) {
      case (null) { null };
      case (?userProgress) { userProgress.get(bookId) };
    };
  };

  // ─── Bookmarks ──────────────────────────────────────────────────────────────

  public shared ({ caller }) func addBookmark(bookId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can add bookmarks");
    };

    let bookmark : Bookmark = {
      user = caller;
      bookId;
    };

    let existingBookmarks = switch (bookmarks.get(caller)) {
      case (?bookmarkList) { bookmarkList };
      case (null) { List.empty<Bookmark>() };
    };

    existingBookmarks.add(bookmark);
    bookmarks.add(caller, existingBookmarks);
  };

  public shared ({ caller }) func removeBookmark(bookId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can remove bookmarks");
    };

    switch (bookmarks.get(caller)) {
      case (null) { () };
      case (?existingBookmarks) {
        let filtered = existingBookmarks.filter(func(b : Bookmark) : Bool { b.bookId != bookId });
        bookmarks.add(caller, filtered);
      };
    };
  };

  public query ({ caller }) func getBookmarks() : async [Bookmark] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view bookmarks");
    };

    switch (bookmarks.get(caller)) {
      case (null) { [] };
      case (?userBookmarks) { userBookmarks.toArray() };
    };
  };

  // ─── User Book Queries ──────────────────────────────────────────────────────

  public query ({ caller }) func getMyUploadedBooks() : async [BookView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can view their uploaded books");
    };

    books.values().toArray().filter(func(book : Book) : Bool { book.uploadedBy == caller }).map(func(book) { BookView.fromBook(book) });
  };

  // ─── Book View Tracking ─────────────────────────────────────────────────────

  public shared ({ caller }) func incrementBookView(bookId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can increment book views");
    };

    switch (books.get(bookId)) {
      case (null) { Runtime.trap("Book not found") };
      case (?book) { book.viewCount += 1 };
    };
  };

  // ─── Admin Dashboard ────────────────────────────────────────────────────────

  public query ({ caller }) func getAdminStats() : async AdminStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view admin stats");
    };

    let totalUsers = users.size();
    let totalBooks = books.size();
    let totalApprovedBooks = books.values().toArray().filter(func(book : Book) : Bool { book.status == #approved }).size();
    let totalPendingBooks = books.values().toArray().filter(func(book : Book) : Bool { book.status == #pending }).size();

    {
      totalUsers;
      totalBooks;
      totalApprovedBooks;
      totalPendingBooks;
    };
  };

  public query ({ caller }) func getMostViewedBooks() : async [BookView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view most viewed books");
    };

    let approvedBooks = books.values().toArray().filter(func(book : Book) : Bool { book.status == #approved });
    let sorted = approvedBooks.sort(
      func(a : Book, b : Book) : Order.Order {
        if (a.viewCount > b.viewCount) { #less }
        else if (a.viewCount < b.viewCount) { #greater }
        else { #equal };
      }
    );
    sorted.map(func(b) { BookView.fromBook(b) });
  };

  public query ({ caller }) func getMostPopularBooks() : async [BookView] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view most popular books");
    };

    let approvedBooks = books.values().toArray().filter(func(book : Book) : Bool { book.status == #approved });

    // Count bookmarks per book
    let bookmarkCounts = Map.empty<Nat, Nat>();
    for ((_, userBookmarkList) in bookmarks.entries()) {
      for (bookmark in userBookmarkList.values()) {
        let current = switch (bookmarkCounts.get(bookmark.bookId)) {
          case (?count) { count };
          case (null) { 0 };
        };
        bookmarkCounts.add(bookmark.bookId, current + 1);
      };
    };

    let sorted = approvedBooks.sort(
      func(a : Book, b : Book) : Order.Order {
        let countA = switch (bookmarkCounts.get(a.id)) {
          case (?c) { c };
          case (null) { 0 };
        };
        let countB = switch (bookmarkCounts.get(b.id)) {
          case (?c) { c };
          case (null) { 0 };
        };
        if (countA > countB) { #less }
        else if (countA < countB) { #greater }
        else { #equal };
      }
    );
    sorted.map(func(b) { BookView.fromBook(b) });
  };
};
