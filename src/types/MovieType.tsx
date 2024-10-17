interface MovieType {
  id: string;
  title: string;
  dateAdded: Date;
  year?: number;
  runtime?: number;
  genre?: string;
  description?: string;
  director?: string;
  starring?: string[];
}

export default MovieType;
