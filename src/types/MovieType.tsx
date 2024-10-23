interface MovieType {
  id: string;
  title: string;
  dateAdded: Date;
  year?: number;
  runtime?: [number?, number?];
  // runtime?: string;
  // runtime?: number;
  // Is it better to have year and runtime as strings or numbers? Runtime would need to follow a specific format.
  genre?: string;
  description?: string;
  director?: string;
  // starring?: string[];
  starring?: string;
}

export default MovieType;
