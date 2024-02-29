import { Navbar, NavbarContent, NavbarItem, Button } from "@nextui-org/react";
import { Link } from "react-router-dom";
import { NavLink, useNavigate } from "react-router-dom";

export default function SiteHeader() {
  const navigate = useNavigate();

  return (
    <Navbar isBordered>
      <NavbarContent className="flex gap-4">
        <NavbarItem>
          <NavLink to="/">Home</NavLink>
        </NavbarItem>
        <NavbarItem>
          <NavLink to="/routines">Routines</NavLink>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button as={Link} onClick={() => navigate(-1)}>
            Back
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} onClick={() => navigate(+1)}>
            Forward
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
