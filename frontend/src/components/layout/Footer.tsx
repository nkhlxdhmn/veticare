import { Link } from "react-router-dom";
import { Container } from "./Container";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-borderLight bg-white pt-24 pb-12 mt-auto">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand */}
          <div className="flex flex-col space-y-6">
            <Link to="/" className="text-2xl font-serif tracking-widest font-medium text-textPrimary transition-opacity duration-200 hover:opacity-70">
              VETICARE
            </Link>
            <p className="text-sm text-textSecondary font-light leading-relaxed max-w-xs">
              Premium pet healthcare powered by artificial intelligence. Providing elegant management for modern pet owners.
            </p>
          </div>

          {/* Column 2: Pages */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-medium tracking-widest uppercase text-textPrimary mb-2">Pages</h4>
            <Link to="/" className="text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">Home</Link>
            <Link to="/animals" className="text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">Animals</Link>
            <Link to="/predictions" className="text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">Prediction</Link>
            <Link to="/pets" className="text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">Pet Records</Link>
            <Link to="/about" className="text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">About</Link>
          </div>

          {/* Column 3: Resources */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-medium tracking-widest uppercase text-textPrimary mb-2">Resources</h4>
            <Link to="/privacy" className="text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">Terms of Service</Link>
            <Link to="/contact" className="text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">Contact Us</Link>
            <Link to="/faq" className="text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">FAQ</Link>
          </div>

          {/* Column 4: Social */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-medium tracking-widest uppercase text-textPrimary mb-2">Social</h4>
            <div className="flex flex-col space-y-4">
              <a href="https://github.com/nkhlxdhmn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">
                <Github className="h-4 w-4" />
                <span>GitHub</span>
              </a>
              <a href="https://linkedin.com/in/nikhilldhimann" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">
                <Linkedin className="h-4 w-4" />
                <span>LinkedIn</span>
              </a>
              <a href="mailto:nikhilldhimann04@gmail.com" className="flex items-center gap-3 text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-borderLight flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-textSecondary tracking-wider uppercase">
            &copy; {new Date().getFullYear()} VETICARE. ALL RIGHTS RESERVED.
          </p>
          <p className="text-xs text-textSecondary tracking-wider uppercase">
            Made with <span className="text-red-500">❤️</span> for Pet Owners
          </p>
        </div>
      </Container>
    </footer>
  );
}
