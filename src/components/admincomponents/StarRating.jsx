import { FaStar } from "react-icons/fa"; // Import star icon from react-icons

function StarRating({ rating, color1, color2 }) {
  // Function to render stars based on the rating value
  return (
    <div style={{ color: "yellow" }}>
      {" "}
      {/* Set star color to yellow */}
      {[...Array(5)].map((_, index) => (
        <FaStar
          key={index}
          color={index < rating ? color1 : color2} // Yellow for filled stars, light gray for empty stars
          size={20} // Adjust size if needed
        />
      ))}
    </div>
  );
}

export default StarRating;
