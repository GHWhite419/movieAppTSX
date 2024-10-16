interface MovieType {
  id: string;
  title: string;
  year?: number;
  runtime?: number;
  genre?: string;
  description?: string;
  director?: string;
  starring?: string[];
  dateAdded?: string;
}

export default MovieType;
