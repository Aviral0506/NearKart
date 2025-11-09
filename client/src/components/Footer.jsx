import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-(url) text-foreground py-8 md:py-12 border-t border-border bg-[url('assets\back4.jpg')] bg-cover">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center justify-between gap-6">
        <p className="text-sm md:text-base text-muted-foreground">
          © {new Date().getFullYear()} NearKart. All Rights Reserved.
        </p>

        <div className="flex items-center gap-6 text-xl md:text-2xl">
          <a
            href="#"
            className="text-muted-foreground hover:text-primary-100 transition-colors duration-300"
            aria-label="Facebook"
          >
            <FaFacebook />
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary-100 transition-colors duration-300"
            aria-label="Instagram"
          >
            <FaInstagram />
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-primary-100 transition-colors duration-300"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
