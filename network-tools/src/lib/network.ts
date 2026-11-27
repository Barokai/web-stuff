export interface NetworkInfo {
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  /** All addresses in the block, including network and broadcast. */
  totalAddresses: number;
  /** Addresses that can be assigned to hosts. */
  usableHosts: number;
  subnetMask: string;
}

export class NetworkCalculator {
  calculateCIDR(cidr: string): NetworkInfo {
    const { ip, prefixLength } = this.parseCIDR(cidr);

    const mask = this.createMask(prefixLength);
    const networkInt = (this.ipToInt(ip) & mask) >>> 0;
    const broadcastInt = (networkInt | ~mask) >>> 0;
    const totalAddresses = 2 ** (32 - prefixLength);

    // /31 (RFC 3021 point-to-point) and /32 (single host) have no separate
    // network/broadcast address, so every address in the block is usable.
    const hasNetworkAndBroadcast = prefixLength <= 30;

    return {
      networkAddress: this.intToIP(networkInt),
      broadcastAddress: this.intToIP(broadcastInt),
      firstHost: this.intToIP(hasNetworkAndBroadcast ? networkInt + 1 : networkInt),
      lastHost: this.intToIP(hasNetworkAndBroadcast ? broadcastInt - 1 : broadcastInt),
      totalAddresses,
      usableHosts: hasNetworkAndBroadcast ? totalAddresses - 2 : totalAddresses,
      subnetMask: this.intToIP(mask),
    };
  }

  isIPInRange(ip: string, cidr: string): boolean {
    if (!this.isValidIP(ip)) {
      throw new Error('Invalid IP address');
    }

    const { ip: networkIP, prefixLength } = this.parseCIDR(cidr);
    const mask = this.createMask(prefixLength);

    return ((this.ipToInt(ip) & mask) >>> 0) === ((this.ipToInt(networkIP) & mask) >>> 0);
  }

  private parseCIDR(cidr: string): { ip: string; prefixLength: number } {
    const [ip, prefix, ...rest] = cidr.trim().split('/');
    if (rest.length > 0 || prefix === undefined || !/^\d{1,2}$/.test(prefix)) {
      throw new Error('Invalid CIDR notation');
    }

    const prefixLength = Number(prefix);
    if (!this.isValidIP(ip) || prefixLength > 32) {
      throw new Error('Invalid CIDR notation');
    }

    return { ip, prefixLength };
  }

  private ipToInt(ip: string): number {
    return ip.split('.').reduce((acc, octet) => acc * 256 + Number(octet), 0);
  }

  private intToIP(int: number): string {
    return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
  }

  private createMask(prefix: number): number {
    // `-1 << 32` is `-1` in JavaScript (shift counts wrap at 32), so /0 needs its own case.
    return prefix === 0 ? 0 : (-1 << (32 - prefix)) >>> 0;
  }

  private isValidIP(ip: string): boolean {
    return (
      /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
      ip.split('.').every((octet) => Number(octet) <= 255)
    );
  }
}
