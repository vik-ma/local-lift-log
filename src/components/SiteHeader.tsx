import { Navbar, NavbarContent, NavbarItem, Button } from "@nextui-org/react";
import { NavLink, useNavigate } from "react-router-dom";

export default function SiteHeader() {
  const navigate = useNavigate();

  return (
    <Navbar isBordered>
      <NavbarContent className="flex gap-4">
        <NavbarItem>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </NavbarItem>
        <NavbarItem>
          <NavLink to="/">Home</NavLink>
        </NavbarItem>
        <NavbarItem>
          <NavLink to="/routines">Routines</NavLink>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
