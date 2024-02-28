import { Navbar, NavbarContent, NavbarItem, Link } from "@nextui-org/react";

export default function SiteHeader() {
  return (
    <Navbar isBordered>
      <NavbarContent className="flex gap-4">
        <NavbarItem>
          <Link color="foreground" href="/">
            Home
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="/routines">
            Routines
          </Link>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
