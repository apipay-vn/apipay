#!/bin/bash
#
# ApiPay CLI Installer
# Install: curl -fsSL https://apipay.vn/install | bash
#
# Installs the `apipay` CLI tool via npm.
# Requires Node.js >= 18 and npm >= 9.
#

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

print_banner() {
  echo ""
  echo -e "${CYAN}${BOLD}  ╔══════════════════════════════════╗${NC}"
  echo -e "${CYAN}${BOLD}  ║        🚀  ApiPay CLI            ║${NC}"
  echo -e "${CYAN}${BOLD}  ║   Payment Gateway Setup Tool     ║${NC}"
  echo -e "${CYAN}${BOLD}  ╚══════════════════════════════════╝${NC}"
  echo ""
}

info() {
  echo -e "${CYAN}ℹ${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

fail() {
  echo -e "${RED}✗${NC} $1"
  exit 1
}

detect_os() {
  local os
  os="$(uname -s)"
  case "$os" in
    Linux*)  echo "linux" ;;
    Darwin*) echo "macos" ;;
    *)       echo "unsupported" ;;
  esac
}

detect_arch() {
  local arch
  arch="$(uname -m)"
  case "$arch" in
    x86_64)  echo "x64" ;;
    aarch64) echo "arm64" ;;
    arm64)   echo "arm64" ;;
    *)       echo "$arch" ;;
  esac
}

check_node() {
  if ! command -v node &>/dev/null; then
    return 1
  fi

  local version
  version="$(node --version 2>/dev/null | sed 's/^v//')"
  local major
  major="$(echo "$version" | cut -d. -f1)"

  if [ "$major" -lt 18 ]; then
    return 1
  fi

  return 0
}

check_npm() {
  if ! command -v npm &>/dev/null; then
    return 1
  fi

  local version
  version="$(npm --version 2>/dev/null)"
  local major
  major="$(echo "$version" | cut -d. -f1)"

  if [ "$major" -lt 9 ]; then
    return 1
  fi

  return 0
}

install_apipay() {
  info "Installing apipay CLI via npm..."
  echo ""

  if npm install -g apipay; then
    echo ""
    success "ApiPay CLI installed successfully!"
  else
    echo ""
    fail "Installation failed. Try running with sudo: ${BOLD}sudo npm install -g apipay${NC}"
  fi
}

verify_installation() {
  if command -v apipay &>/dev/null; then
    local version
    version="$(apipay --version 2>/dev/null || echo 'unknown')"
    success "apipay ${version} is ready!"
    return 0
  else
    warn "Installation completed but 'apipay' command not found in PATH."
    info "Try opening a new terminal, or check your npm global bin directory:"
    echo "  npm config get prefix"
    return 1
  fi
}

main() {
  print_banner

  # Detect OS
  local os
  os="$(detect_os)"
  local arch
  arch="$(detect_arch)"

  info "Detected: ${BOLD}${os}/${arch}${NC}"

  if [ "$os" = "unsupported" ]; then
    fail "Unsupported operating system: $(uname -s). ApiPay CLI supports macOS and Linux."
  fi

  # Check Node.js
  if check_node; then
    local node_version
    node_version="$(node --version)"
    success "Node.js ${node_version}"
  else
    echo ""
    fail "Node.js >= 18 is required but not found.

  Install Node.js using one of these methods:

    ${BOLD}nvm (recommended):${NC}
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
      nvm install 22

    ${BOLD}Direct download:${NC}
      https://nodejs.org/en/download/

  Then re-run this script:
    curl -fsSL https://apipay.vn/install | bash"
  fi

  # Check npm
  if check_npm; then
    local npm_version
    npm_version="$(npm --version)"
    success "npm ${npm_version}"
  else
    fail "npm >= 9 is required. Update with: ${BOLD}npm install -g npm@latest${NC}"
  fi

  echo ""

  # Install
  install_apipay

  echo ""

  # Verify
  verify_installation

  echo ""
  echo -e "  ${BOLD}Get started:${NC}"
  echo -e "    ${CYAN}apipay setup${NC}        Interactive setup wizard"
  echo -e "    ${CYAN}apipay login${NC}       Authenticate with your account"
  echo -e "    ${CYAN}apipay --help${NC}      Show all commands"
  echo ""
  echo -e "  ${BOLD}Documentation:${NC} ${CYAN}https://apipay.vn/docs${NC}"
  echo ""
}

main "$@"
