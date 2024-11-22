import "bootstrap/dist/css/bootstrap.min.css";

export default function Footer() {
  return (
    <footer className="bg-dark text-light text-center fixed-bottom">
      <div className="container p-4">
        <div className="text-center">
          © {new Date().getFullYear()} www.mfms.com. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
