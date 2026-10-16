import { Link } from "react-router";

import "./marketing.css";

interface NavLink {
  label: string;
  href: string;
}

interface NavProps {
  links: NavLink[];
}

export const Nav = ({ links }: NavProps) => (
  <header className="nav">
    <div className="container nav__row">
      <Link className="nav__brand" to="/" aria-label="Sneakers-PAM">
        <img src={`${import.meta.env.BASE_URL}img/mark-light.svg`} width={28} height={28} alt="" />
        sneakers·pam
      </Link>
      <nav aria-label="Primary">
        <ul className="nav__links">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </header>
);
