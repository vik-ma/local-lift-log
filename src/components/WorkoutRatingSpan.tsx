type WorkoutRatingSpanProps = {
  rating: number;
};

export const WorkoutRatingSpan = ({ rating }: WorkoutRatingSpanProps) => {
  if (rating === 1) return <span className="text-success">Good</span>;
  if (rating === 2) return <span className="text-danger">Bad</span>;
  return <span>No Rating</span>;
};
