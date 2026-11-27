import { describe, expect, it } from 'vitest';
import { NetworkCalculator } from './network';

const calc = new NetworkCalculator();

describe('calculateCIDR', () => {
  it('excludes network and broadcast from the host range of a /24', () => {
    expect(calc.calculateCIDR('192.168.1.0/24')).toEqual({
      networkAddress: '192.168.1.0',
      broadcastAddress: '192.168.1.255',
      firstHost: '192.168.1.1',
      lastHost: '192.168.1.254',
      totalAddresses: 256,
      usableHosts: 254,
      subnetMask: '255.255.255.0',
    });
  });

  it('normalizes a host address to its network', () => {
    const info = calc.calculateCIDR('10.1.2.3/8');
    expect(info.networkAddress).toBe('10.0.0.0');
    expect(info.broadcastAddress).toBe('10.255.255.255');
    expect(info.usableHosts).toBe(16_777_214);
  });

  it('handles /30 as the smallest block with network and broadcast', () => {
    const info = calc.calculateCIDR('172.16.0.4/30');
    expect([info.firstHost, info.lastHost, info.usableHosts]).toEqual(['172.16.0.5', '172.16.0.6', 2]);
  });

  it('treats both addresses of a /31 as usable', () => {
    const info = calc.calculateCIDR('10.0.0.0/31');
    expect([info.firstHost, info.lastHost, info.usableHosts]).toEqual(['10.0.0.0', '10.0.0.1', 2]);
  });

  it('treats a /32 as a single host', () => {
    const info = calc.calculateCIDR('8.8.8.8/32');
    expect([info.firstHost, info.lastHost, info.usableHosts]).toEqual(['8.8.8.8', '8.8.8.8', 1]);
    expect(info.subnetMask).toBe('255.255.255.255');
  });

  it('handles /0', () => {
    const info = calc.calculateCIDR('1.2.3.4/0');
    expect(info.networkAddress).toBe('0.0.0.0');
    expect(info.broadcastAddress).toBe('255.255.255.255');
    expect(info.subnetMask).toBe('0.0.0.0');
    expect(info.totalAddresses).toBe(2 ** 32);
  });

  it.each(['192.168.1.0', '192.168.1.0/', '192.168.1.0/33', '192.168.1.0/abc', '256.1.1.1/24', '1.2.3/24', '1.2.3.4/24/1'])(
    'rejects %s',
    (input) => {
      expect(() => calc.calculateCIDR(input)).toThrow('Invalid CIDR notation');
    },
  );
});

describe('isIPInRange', () => {
  it('matches addresses inside the block', () => {
    expect(calc.isIPInRange('192.168.1.42', '192.168.1.0/24')).toBe(true);
    expect(calc.isIPInRange('192.168.2.1', '192.168.1.0/24')).toBe(false);
  });

  it('matches across the sign bit', () => {
    expect(calc.isIPInRange('200.1.2.3', '200.0.0.0/8')).toBe(true);
    expect(calc.isIPInRange('10.0.0.1', '200.0.0.0/8')).toBe(false);
  });

  it('matches everything for /0', () => {
    expect(calc.isIPInRange('8.8.8.8', '0.0.0.0/0')).toBe(true);
  });

  it('rejects an invalid IP', () => {
    expect(() => calc.isIPInRange('300.1.1.1', '10.0.0.0/8')).toThrow('Invalid IP address');
  });
});
