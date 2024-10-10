interface MovieType {
  title: string;
  year?: number;
  runtime?: number;
  genre?: string;
  synopsis?: string;
  director?: string;
  starring?: string[];
}

export default MovieType;
