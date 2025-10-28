#!/bin/bash

# Avalanche Local Node Management Script
# Uses Avalanche CLI exclusively for local development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if Avalanche CLI is installed
check_avalanche_cli() {
    if command -v avalanche &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to print installation instructions
print_install_instructions() {
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  Avalanche CLI not found. Please install it:              ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}macOS:${NC}"
    echo "  brew install ava-labs/tap/avalanche-cli"
    echo ""
    echo -e "${GREEN}Linux:${NC}"
    echo "  curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s"
    echo ""
    echo -e "${GREEN}Windows (WSL):${NC}"
    echo "  curl -sSfL https://raw.githubusercontent.com/ava-labs/avalanche-cli/main/scripts/install.sh | sh -s"
    echo ""
    echo -e "${YELLOW}Documentation:${NC} https://docs.avax.network/tooling/cli"
    echo ""
}

# Check node health
check_node_health() {
    local max_retries=30
    local retry=0
    
    echo -e "${YELLOW}Checking node health...${NC}"
    
    while [ $retry -lt $max_retries ]; do
        if curl -s -X POST --data '{
            "jsonrpc":"2.0",
            "id":1,
            "method":"eth_chainId"
        }' -H 'Content-Type: application/json' http://127.0.0.1:9650/ext/bc/C/rpc &> /dev/null; then
            return 0
        fi
        retry=$((retry + 1))
        echo -ne "  Attempt $retry/$max_retries...\r"
        sleep 1
    done
    
    return 1
}

# Get node info
get_node_info() {
    local chain_id_hex=$(curl -s -X POST --data '{
        "jsonrpc":"2.0",
        "id":1,
        "method":"eth_chainId"
    }' -H 'Content-Type: application/json' http://127.0.0.1:9650/ext/bc/C/rpc | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    
    local chain_id_dec=$((chain_id_hex))
    
    local block_number_hex=$(curl -s -X POST --data '{
        "jsonrpc":"2.0",
        "id":1,
        "method":"eth_blockNumber"
    }' -H 'Content-Type: application/json' http://127.0.0.1:9650/ext/bc/C/rpc | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    
    local block_number_dec=$((block_number_hex))
    
    echo "  RPC URL: http://127.0.0.1:9650/ext/bc/C/rpc"
    echo "  Chain ID: $chain_id_hex ($chain_id_dec)"
    echo "  Current block: $block_number_dec"
}

# Start node
start_node() {
    if ! check_avalanche_cli; then
        echo -e "${RED}ERROR: Avalanche CLI not installed!${NC}"
        print_install_instructions
        exit 1
    fi
    
    echo -e "${GREEN}Starting Avalanche local network...${NC}"
    avalanche network start
    
    if check_node_health; then
        echo -e "${GREEN}✓ Local Avalanche C-Chain is running${NC}"
        get_node_info
        echo ""
        echo -e "${YELLOW}Pre-funded test account (ewoq):${NC}"
        echo "  Address: 0x8db97C7cEcE249c2b98bDC0226Cc4C2A57BF52FC"
        echo "  Private Key: 56289e99c94b6912bfc12adc093c9b51124f0dc54ac7a766b2bc5ccf558d8027"
        echo "  Balance: 50,000,000 AVAX"
    else
        echo -e "${RED}✗ Failed to start node or node is not responding${NC}"
        exit 1
    fi
}

# Stop node
stop_node() {
    if ! check_avalanche_cli; then
        echo -e "${RED}ERROR: Avalanche CLI not installed!${NC}"
        print_install_instructions
        exit 1
    fi
    
    echo -e "${YELLOW}Stopping Avalanche local network...${NC}"
    avalanche network stop
    echo -e "${GREEN}✓ Stopped${NC}"
}

# Check status
status_node() {
    echo -e "${YELLOW}Checking node status...${NC}"
    
    if curl -s -X POST --data '{
        "jsonrpc":"2.0",
        "id":1,
        "method":"eth_chainId"
    }' -H 'Content-Type: application/json' http://127.0.0.1:9650/ext/bc/C/rpc &> /dev/null; then
        echo -e "${GREEN}✓ Node is running${NC}"
        get_node_info
    else
        echo -e "${RED}✗ Node is not running${NC}"
        echo ""
        echo "Start the node with: yarn avalanche:up"
    fi
}

# Clean node data
clean_node() {
    if ! check_avalanche_cli; then
        echo -e "${RED}ERROR: Avalanche CLI not installed!${NC}"
        print_install_instructions
        exit 1
    fi
    
    echo -e "${YELLOW}Cleaning local network data...${NC}"
    avalanche network clean
    echo -e "${GREEN}✓ Cleaned${NC}"
}

# Restart node
restart_node() {
    echo -e "${YELLOW}Restarting Avalanche local network...${NC}"
    stop_node
    sleep 2
    start_node
}

# Main command dispatcher
case "$1" in
    start)
        start_node
        ;;
    stop)
        stop_node
        ;;
    status)
        status_node
        ;;
    clean)
        clean_node
        ;;
    restart)
        restart_node
        ;;
    *)
        echo "Usage: $0 {start|stop|status|clean|restart}"
        exit 1
        ;;
esac
