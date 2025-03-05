import { NetworkCalculator } from './lib/network.js';

document.addEventListener('DOMContentLoaded', () => {
  const cidrInput = document.getElementById('cidrInput') as HTMLInputElement;
  const calculateBtn = document.getElementById('calculateBtn') as HTMLButtonElement;
  const ipCheckInput = document.getElementById('ipCheckInput') as HTMLInputElement;
  const checkBtn = document.getElementById('checkBtn') as HTMLButtonElement;
  const networkInfo = document.getElementById('networkInfo') as HTMLDivElement;
  const checkResult = document.getElementById('checkResult') as HTMLDivElement;

  const calculator = new NetworkCalculator();

  // Add keypress handlers
  cidrInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      calculateBtn.click();
    }
  });

  ipCheckInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      checkBtn.click();
    }
  });

  calculateBtn.addEventListener('click', () => {
    try {
      const result = calculator.calculateCIDR(cidrInput.value.trim());
      displayNetworkInfo(result);

      // If IP check input has a value, trigger check
      if (ipCheckInput.value.trim()) {
        checkBtn.click();
      }
    } catch (error) {
      networkInfo.innerHTML = `<div class="info-item error">Invalid CIDR notation</div>`;
    }
  });

  checkBtn.addEventListener('click', () => {
    try {
      const ip = ipCheckInput.value.trim();
      const cidr = cidrInput.value.trim();
      const isInRange = calculator.isIPInRange(ip, cidr);

      checkResult.className = `check-result ${isInRange ? 'success' : 'error'}`;
      checkResult.textContent = isInRange
        ? `✓ IP ${ip} is within the range of ${cidr}`
        : `✗ IP ${ip} is NOT within the range of ${cidr}`;
    } catch (error) {
      checkResult.className = 'check-result error';
      checkResult.textContent = 'Invalid IP address or CIDR notation';
    }
  });

  function displayNetworkInfo(info: any) {
    networkInfo.innerHTML = `
      <div class="info-item">
        <div class="info-label">Network Address</div>
        <div class="info-value">${info.networkAddress}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Broadcast Address</div>
        <div class="info-value">${info.broadcastAddress}</div>
      </div>
      <div class="info-item">
        <div class="info-label">First Host</div>
        <div class="info-value">${info.firstHost}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Last Host</div>
        <div class="info-value">${info.lastHost}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Total Hosts</div>
        <div class="info-value">${info.totalHosts}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Subnet Mask</div>
        <div class="info-value">${info.subnetMask}</div>
      </div>
    `;
  }
});
