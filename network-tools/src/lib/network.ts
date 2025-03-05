export class NetworkCalculator {
  calculateCIDR(cidr: string) {
    const [ip, prefix] = cidr.split('/');
    const prefixLength = parseInt(prefix);

    if (!this.isValidIP(ip) || prefixLength < 0 || prefixLength > 32) {
      throw new Error('Invalid CIDR notation');
    }

    const ipInt = this.ipToInt(ip);
    const mask = this.createMask(prefixLength);
    const networkInt = ipInt & mask;
    const broadcastInt = networkInt | (~mask);

    return {
      networkAddress: this.intToIP(networkInt),
      broadcastAddress: this.intToIP(broadcastInt >>> 0),
      firstHost: this.intToIP(networkInt),
      lastHost: this.intToIP(broadcastInt >>> 0),
      totalHosts: Math.pow(2, 32 - prefixLength),
      subnetMask: this.intToIP(mask)
    };
  }

  isIPInRange(ip: string, cidr: string): boolean {
    if (!this.isValidIP(ip)) {
      throw new Error('Invalid IP address');
    }

    const [networkIP, prefix] = cidr.split('/');
    const prefixLength = parseInt(prefix);

    if (!this.isValidIP(networkIP) || prefixLength < 0 || prefixLength > 32) {
      throw new Error('Invalid CIDR notation');
    }

    const ipInt = this.ipToInt(ip);
    const networkInt = this.ipToInt(networkIP);
    const mask = this.createMask(prefixLength);

    return (ipInt & mask) === (networkInt & mask);
  }

  private ipToInt(ip: string): number {
    return ip.split('.')
      .reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  private intToIP(int: number): string {
    return [
      (int >>> 24) & 255,
      (int >>> 16) & 255,
      (int >>> 8) & 255,
      int & 255
    ].join('.');
  }

  private createMask(prefix: number): number {
    // Create a mask with 'prefix' number of 1s followed by zeros
    return -1 << (32 - prefix);
  }

  private isValidIP(ip: string): boolean {
    return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
      ip.split('.').every(octet => {
        const num = parseInt(octet);
        return num >= 0 && num <= 255;
      });
  }
}
