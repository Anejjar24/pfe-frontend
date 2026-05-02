
import { useState, useEffect, useCallback } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
import { PropTypes } from "prop-types";
import {
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
} from "reactstrap";

const SIDEBAR_FULL = 200; // px — expanded
const SIDEBAR_MINI = 68;  // px — icon-only
const MD_BREAKPOINT = 768; // px — Bootstrap md

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [mini, setMini] = useState(false);

  // Apply margin-left to .main-content only on desktop (≥ MD_BREAKPOINT).
  // On mobile Argon's own CSS controls the layout — we must not interfere.
  const applyMargin = useCallback((isMini) => {
    if (window.innerWidth < MD_BREAKPOINT) {
      // Reset any inline margin so Argon's responsive CSS takes over
      const el = document.querySelector(".main-content");
      if (el) el.style.marginLeft = "";
      return;
    }
    const el = document.querySelector(".main-content");
    if (!el) return;
    el.style.transition  = "margin-left 0.28s ease";
    el.style.marginLeft  = (isMini ? SIDEBAR_MINI : SIDEBAR_FULL) + "px";
  }, []);

  // Re-apply on mini state change
  useEffect(() => {
    applyMargin(mini);
  }, [mini, applyMargin]);

  // Re-apply on window resize so switching viewport resets correctly
  useEffect(() => {
    const onResize = () => applyMargin(mini);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mini, applyMargin]);

  const toggleCollapse = () => setCollapseOpen((v) => !v);
  const closeCollapse  = () => setCollapseOpen(false);

  const createLinks = (routes) =>
    routes.map((prop, key) => (
      <NavItem key={key}>
        <NavLink
          to={prop.layout + prop.path}
          tag={NavLinkRRD}
          onClick={closeCollapse}
          title={mini ? prop.name : undefined}
          style={linkStyle(mini)}
        >
          <i className={prop.icon} style={iconStyle(mini)} />
          {!mini && prop.name}
        </NavLink>
      </NavItem>
    ));

  const { routes, logo } = props;
  let navbarBrandProps = {};
  if (logo?.innerLink)      navbarBrandProps = { to: logo.innerLink, tag: Link };
  else if (logo?.outterLink) navbarBrandProps = { href: logo.outterLink, target: "_blank" };

  return (
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
      style={{
        width:      (mini ? SIDEBAR_MINI : SIDEBAR_FULL) + "px",
        minWidth:   (mini ? SIDEBAR_MINI : SIDEBAR_FULL) + "px",
        maxWidth:   (mini ? SIDEBAR_MINI : SIDEBAR_FULL) + "px",
        transition: "width 0.28s ease, min-width 0.28s ease, max-width 0.28s ease",
        overflow:   "hidden",
      }}
    >
      <Container fluid>
        {/* ── Mobile toggler ─────────────────────────────────────────────── */}
        <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
          <span className="navbar-toggler-icon" />
        </button>

        {/* ── Logo — swaps to box.png in mini mode ───────────────────────── */}
        {logo && (
          <NavbarBrand
            className="pt-0"
            {...navbarBrandProps}
            style={{
              display:        "flex",
              justifyContent: mini ? "center" : "flex-start",
              width:          "100%",
            }}
          >
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={
                mini
                  ? require("../../assets/img/brand/box.png")
                  : logo.imgSrc
              }
              style={{
                maxWidth:   mini ? "36px" : "140px",
                height:     "auto",
                transition: "max-width 0.28s ease",
              }}
            />
          </NavbarBrand>
        )}

        {/* ── Mobile user icons ──────────────────────────────────────────── */}
        <Nav className="align-items-center d-md-none">
          <UncontrolledDropdown nav>
            <DropdownToggle nav className="nav-link-icon">
              <i className="ni ni-bell-55" />
            </DropdownToggle>
            <DropdownMenu
              aria-labelledby="navbar-default_dropdown_1"
              className="dropdown-menu-arrow"
              right
            >
              <DropdownItem>Action</DropdownItem>
              <DropdownItem>Another action</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Something else here</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>

          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  <img
                    alt="..."
                    src={require("../../assets/img/theme/team-1-800x800.jpg")}
                  />
                </span>
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Welcome!</h6>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-single-02" /><span>My profile</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-settings-gear-65" /><span>Settings</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-calendar-grid-58" /><span>Activity</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-support-16" /><span>Support</span>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()}>
                <i className="ni ni-user-run" /><span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>

        {/* ── Collapsible nav ────────────────────────────────────────────── */}
        <Collapse navbar isOpen={collapseOpen}>
          {/* Mobile collapse header */}
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo && (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink
                    ? <Link to={logo.innerLink}><img alt={logo.imgAlt} src={logo.imgSrc} /></Link>
                    : <a href={logo.outterLink}><img alt={logo.imgAlt} src={logo.imgSrc} /></a>
                  }
                </Col>
              )}
              <Col className="collapse-close" xs="6">
                <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
                  <span /><span />
                </button>
              </Col>
            </Row>
          </div>

          {/* Mobile search */}
          <Form className="mt-4 mb-3 d-md-none">
            <InputGroup className="input-group-rounded input-group-merge">
              <Input
                aria-label="Search"
                className="form-control-rounded form-control-prepended"
                placeholder="Search"
                type="search"
              />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <span className="fa fa-search" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Form>

          {/* ── Hamburger toggle — desktop only, styled as nav item ────────── */}
          <Nav navbar className="d-none d-md-block mb-1">
            <NavItem>
              <NavLink
                href="#"
                onClick={(e) => { e.preventDefault(); setMini((v) => !v); }}
                title={mini ? "Expand sidebar" : "Collapse sidebar"}
                style={{ ...linkStyle(mini), cursor: "pointer" }}
              >
                <i
                  className="fa fa-bars"
                  style={{ ...iconStyle(mini), fontSize: "1.15rem" }}
                />
                {/* No label — icon only so it looks like a standard menu btn */}
              </NavLink>
            </NavItem>
          </Nav>

          {/* Primary routes */}
          <Nav navbar>{createLinks(routes)}</Nav>

          <hr className="my-3" />

          {!mini && (
            <h6 className="navbar-heading text-muted">Side Parts</h6>
          )}

          <Nav className="mb-md-3" navbar>
            {[
              { href: "https://", icon: "ni ni-spaceship", label: "part1" },
              { href: "https://", icon: "ni ni-palette",   label: "part2" },
              { href: "https://", icon: "ni ni-ui-04",     label: "part3" },
            ].map((item, key) => (
              <NavItem key={key}>
                <NavLink
                  href={item.href}
                  title={mini ? item.label : undefined}
                  style={linkStyle(mini)}
                >
                  <i className={item.icon} style={iconStyle(mini)} />
                  {!mini && item.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

// ── Style helpers ─────────────────────────────────────────────────────────────

function linkStyle(mini) {
  return {
    display:        "flex",
    alignItems:     "center",
    justifyContent: mini ? "center" : "flex-start",
    padding:        mini ? "0.625rem 0" : "0.625rem 1rem",
    whiteSpace:     "nowrap",
    overflow:       "hidden",
    transition:     "padding 0.28s ease",
  };
}

function iconStyle(mini) {
  return {
    fontSize:    "0.95rem",
    minWidth:    "1.4rem",
    textAlign:   "center",
    marginRight: mini ? "0" : "0.5rem",
    transition:  "margin 0.28s ease",
  };
}

// ── Prop types ────────────────────────────────────────────────────────────────

Sidebar.defaultProps = { routes: [{}] };

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink:  PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc:     PropTypes.string.isRequired,
    imgAlt:     PropTypes.string.isRequired,
  }),
};

export default Sidebar;