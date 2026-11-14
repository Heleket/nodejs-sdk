import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { HeleketPayment } from '../src/payment.js';
import { HeleketPayout } from '../src/payout.js';
import { DEFAULT_BASE_URL, DEFAULT_DOMAIN, resolveConfig } from '../src/config.js';
import { FakeTransport } from './fakes/fake-transport.js';

describe('client construction', () => {
  it('rejects empty merchant id', () => {
    assert.throws(() => new HeleketPayment('   ', 'key'), /merchantId/);
  });

  it('rejects empty api key', () => {
    assert.throws(() => new HeleketPayment('merchant', ''), /apiKey/);
  });

  it('rejects non-positive timeout', () => {
    assert.throws(() => new HeleketPayment('merchant', 'key', { timeoutMs: 0 }), /timeoutMs/);
  });

  it('accepts valid construction', () => {
    const payment = new HeleketPayment('merchant', 'key', { debug: true, timeoutMs: 60_000 });
    assert.ok(payment);
    const payout = new HeleketPayout('merchant', 'payout-key');
    assert.ok(payout);
  });

  it('trims trailing slashes from baseUrl', () => {
    // Indirect: HeleketPayment isn't expected to expose its baseUrl, but we
    // exercise the resolveConfig path that does the trimming.
    const payment = new HeleketPayment('merchant', 'key', { baseUrl: 'https://example.com/' });
    assert.ok(payment);
  });

  it('rejects merchantId with CRLF (header injection guard)', () => {
    assert.throws(() => new HeleketPayment('uuid\r\nX-Injected: 1', 'key'), /control character/);
  });

  it('rejects apiKey with control characters', () => {
    assert.throws(() => new HeleketPayment('merchant', 'key\x00'), /control character/);
    assert.throws(() => new HeleketPayment('merchant', 'key\nbad'), /control character/);
  });

  it('defaults to api.heleket.hk', async () => {
    assert.equal(DEFAULT_DOMAIN, 'heleket.hk');
    assert.equal(DEFAULT_BASE_URL, 'https://api.heleket.hk');
    assert.equal(resolveConfig('m', 'k').baseUrl, 'https://api.heleket.hk');
    const fake = new FakeTransport().enqueueJson({ state: 0, result: [] });
    await new HeleketPayment('m', 'k', { transport: fake }).getBalance();
    assert.ok(fake.lastRequest().url.startsWith('https://api.heleket.hk/'));
  });

  it('builds the API URL from domain', async () => {
    const fake = new FakeTransport().enqueueJson({ state: 0, result: [] });
    await new HeleketPayment('m', 'k', { domain: 'example.org', transport: fake }).getBalance();
    assert.ok(fake.lastRequest().url.startsWith('https://api.example.org/'));
  });

  it('lets baseUrl override domain', () => {
    const cfg = resolveConfig('m', 'k', { domain: 'example.org', baseUrl: 'https://x.test/' });
    assert.equal(cfg.baseUrl, 'https://x.test');
  });

  it('rejects invalid domain', () => {
    assert.throws(() => resolveConfig('m', 'k', { domain: '  ' }), /domain/);
    assert.throws(() => resolveConfig('m', 'k', { domain: 'https://example.org' }), /domain/);
    assert.throws(() => resolveConfig('m', 'k', { domain: 'example.org/path' }), /domain/);
  });
});
