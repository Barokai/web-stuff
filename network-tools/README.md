# Network Tools

A collection of network-related tools and utilities.

## CIDR Calculator

Calculate IP ranges from CIDR notation and check if IP addresses are within a specific range.

### Features

- Convert CIDR notation to IP range information
- Display network address, broadcast address, and host range
- Calculate total number of usable hosts
- Check if a specific IP is within a CIDR range
- Real-time validation of input

### Technologies

- TypeScript
- Modern JavaScript (ES6+)
- CSS3 with CSS Variables
- Modular code structure

### Usage

1. Enter a CIDR notation (e.g., 192.168.1.0/24)

2. Click "Calculate Range" to see detailed network information

3. To check if an IP is in range:
   - Enter the IP address in the check field
   - Click "Check IP" to verify

### Setup

```bash
npm install
npm run watch
```

## Browser Support

Requires a modern browser supporting:

- ES Modules
- TypeScript
- CSS Custom Properties

## References

- [Understanding IP Addressing](https://www.rfc-editor.org/rfc/rfc1918)
- [CIDR Notation Explained](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)
- [IPv4 Subnetting](https://www.rfc-editor.org/rfc/rfc950)

## Disclaimer

This tool was developed with assistance from GitHub Copilot (powered by OpenAI's GPT-4) and Claude 3.5 Sonnet. While the calculations have been tested, please verify critical network configurations independently. The authors make no guarantees about the accuracy or reliability of the results.
