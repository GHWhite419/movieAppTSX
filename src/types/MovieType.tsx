interface MovieType {
  id: string;
  title: string;
  dateAdded: Date;
  year?: number;
  runtime?: [number?, number?];
  // image?: string;
  // Eventually image will refer to a url string and be displayed along the movie's info.
  genre?: string;
  description?: string;
  director?: string;
  starring?: string;
}

export default MovieType;
