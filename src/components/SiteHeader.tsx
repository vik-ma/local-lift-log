import { Navbar, NavbarContent, NavbarItem } from "@nextui-org/react";
import { NavLink } from "react-router-dom";

export default function SiteHeader() {
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
    </Navbar>
  );
}
