interface MovieType {
  // Firestore may be able to generate an id for us
  id?: string;
  //   Should I make id required or not? If required, which types to declare to avoid errors from MovieList (which doesn't pass in an id, as it's passed from the context). Can I still use a Partial?
  title: string;
  year?: number;
  runtime?: number;
  genre?: string;
  description?: string;
  director?: string;
  starring?: string[];
}

export default MovieType;
